import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { BattlePhase } from "../types";
import { getGoldReward } from "./gameMath";
import { playSfx } from "../sound";
import {
  BEAM_BOSS_HP_RATIO,
  BEAM_TIMING,
  EXECUTE_HP_RATIO,
  SHOUT_DAMAGE_BONUS,
  INITIAL_SKILL_TIMERS,
  getSkill,
  STEAL_GOLD_RATIO,
  isSkillActive,
  type SkillId,
  type SkillTimers,
} from "./skills";

// Player's win animation is 480ms/cycle and plays 3x on a boss kill (see BattleScene's
// PlayerFighter) — the defeated-phase delay needs to be at least that long so the
// celebration isn't cut short by the regular-mob respawn timing.
const BOSS_RESPAWN_DELAY = 1500;
const MOB_RESPAWN_DELAY = 650;
const ENTER_DELAY = 220;

type Timer = ReturnType<typeof setTimeout>;

function clearTimers(ref: { current: Timer[] }) {
  ref.current.forEach((timer) => clearTimeout(timer));
  ref.current = [];
}

export function useAutoBattle({
  attack,
  criticalDamage,
  criticalChance,
  goldBonus,
  missChance = 0,
  hitCount = 1,
  cooldownReductionMs = 0,
  bossDamage = 0,
  firstStrikeMultiplier = 0,
  extraHitChance = 0,
  executeBonus = 0,
  enemyMaxHp,
  boss,
  speedMultiplier = 1,
  onDefeat,
  onBonusGold,
  onMiss,
  equippedSkill,
}: {
  attack: number;
  criticalDamage: number;
  criticalChance: number;
  goldBonus: number;
  // Percent chance a swing whiffs entirely (0 damage, no on-hit effects) — a companion
  // outfit's drawback (e.g. tetoGini).
  missChance?: number;
  // Extra strikes landed per swing (e.g. assassinGini's twin daggers) — each rolls its
  // own miss/crit independently; a kill on an earlier strike skips the rest.
  hitCount?: number;
  // Shaved off every active skill's cooldown on cast (e.g. egenGini) — never below 0.
  cooldownReductionMs?: number;
  // Food buffs: % more damage to bosses, % chance a swing lands one extra strike, and
  // points added to Execute's HP threshold.
  bossDamage?: number;
  // 사무라이기니: the first strike on each enemy is a sure crit worth this many normal hits
  // (0 = off). While it's on, battle is auto only — manual taps would waste the draw.
  firstStrikeMultiplier?: number;
  extraHitChance?: number;
  executeBonus?: number;
  enemyMaxHp: number;
  boss: boolean;
  // Scales down every auto-battle timer delay — e.g. 2 halves them, doubling the pace.
  speedMultiplier?: number;
  onDefeat: (goldReward: number) => void;
  // Gold earned outside a kill (the Steal skill's per-hit scatter).
  onBonusGold: (amount: number) => void;
  // Called on every whiffed strike (for the hidden "missed N times" quest).
  onMiss?: () => void;
  equippedSkill: SkillId | null;
}) {
  const [enemyHp, setEnemyHp] = useState(enemyMaxHp);
  const [phase, setPhase] = useState<BattlePhase>("idle");
  const [autoChosen, setIsAutoBattle] = useState(true);
  const autoLocked = firstStrikeMultiplier > 0;
  const isAutoBattle = autoChosen || autoLocked;
  // Bumped on each first-strike draw, so the scene can play its slash.
  const [firstStrikeId, setFirstStrikeId] = useState(0);
  const [enemyId, setEnemyId] = useState(1);
  const [lastGoldReward, setLastGoldReward] = useState(0);
  const [lastCritical, setLastCritical] = useState(false);
  const [damageEvents, setDamageEvents] = useState<{ id: number; amount: number; critical: boolean; missed?: boolean }[]>([]);
  const [goldEvents, setGoldEvents] = useState<{ id: number; amount: number }[]>([]);
  const [skillTimers, setSkillTimers] = useState<SkillTimers>(INITIAL_SKILL_TIMERS);
  const [lastSkillCastAt, setLastSkillCastAt] = useState(0);
  // Bumped each time Execute finishes an enemy off, so the scene can play its effect.
  const [executeId, setExecuteId] = useState(0);
  // Bumped per skill on each cast, so the scene can play that skill's effect.
  const [castIds, setCastIds] = useState<Record<SkillId, number>>({
    beam: 0,
    steal: 0,
    focus: 0,
    execute: 0,
    shout: 0,
    diligent: 0,
    glutton: 0,
  });
  // Whether the current/last kill was an Execute — the player strikes a crit pose for it.
  const [lastKillExecuted, setLastKillExecuted] = useState(false);
  const hpRef = useRef(enemyMaxHp);
  const phaseRef = useRef<BattlePhase>("idle");
  const attackRef = useRef(attack);
  const criticalDamageRef = useRef(criticalDamage);
  const criticalChanceRef = useRef(criticalChance);
  const goldBonusRef = useRef(goldBonus);
  const missChanceRef = useRef(missChance);
  const hitCountRef = useRef(hitCount);
  const cooldownReductionRef = useRef(cooldownReductionMs);
  const bossDamageRef = useRef(bossDamage);
  const firstStrikeRef = useRef(firstStrikeMultiplier);
  // The enemy (by epoch) that already took its first strike.
  const firstStrikeEpochRef = useRef(-1);
  const extraHitChanceRef = useRef(extraHitChance);
  const executeBonusRef = useRef(executeBonus);
  const maxHpRef = useRef(enemyMaxHp);
  const bossRef = useRef(boss);
  const speedMultiplierRef = useRef(speedMultiplier);
  const onDefeatRef = useRef(onDefeat);
  const onBonusGoldRef = useRef(onBonusGold);
  const onMissRef = useRef(onMiss);
  const equippedSkillRef = useRef(equippedSkill);
  const skillTimersRef = useRef(INITIAL_SKILL_TIMERS);
  // Pose timers for manual taps — cut short by a kill or by switching to auto.
  const manualTimersRef = useRef<Timer[]>([]);
  // Death → respawn → ready chain, shared by every way an enemy can die.
  const respawnTimersRef = useRef<Timer[]>([]);
  // Bumped whenever the current enemy goes away (kill or stage jump); the auto loop's
  // pending timers check it so a swing aimed at the old enemy never lands.
  const enemyEpochRef = useRef(0);
  // Set while auto-battle runs: restarts the attack loop once a fresh enemy is ready.
  const autoResumeRef = useRef<(() => void) | null>(null);
  const eventIdRef = useRef(0);
  const eventTimersRef = useRef<Timer[]>([]);

  // Every landed hit gets its own floating "-damage" popup, independent of whatever the
  // attack sprite animation is doing — so a burst of taps shows a burst of numbers instead
  // of fighting the sprite for control of a single shared instance.
  const pushDamageEvent = useCallback((amount: number, critical: boolean) => {
    const id = ++eventIdRef.current;
    setDamageEvents((events) => [...events, { id, amount, critical }]);
    const timer = setTimeout(() => {
      setDamageEvents((events) => events.filter((event) => event.id !== id));
    }, 700);
    eventTimersRef.current.push(timer);
  }, []);

  // Same floating popup slot as a damage number, but reads "MISS" instead — a whiffed
  // swing never reaches dealDamage, so nothing else about the hit (hp, steal, execute) runs.
  const pushMissEvent = useCallback(() => {
    const id = ++eventIdRef.current;
    onMissRef.current?.();
    setDamageEvents((events) => [...events, { id, amount: 0, critical: false, missed: true }]);
    const timer = setTimeout(() => {
      setDamageEvents((events) => events.filter((event) => event.id !== id));
    }, 700);
    eventTimersRef.current.push(timer);
  }, []);

  const pushGoldEvent = useCallback((amount: number) => {
    const id = ++eventIdRef.current;
    setGoldEvents((events) => [...events, { id, amount }]);
    const timer = setTimeout(() => {
      setGoldEvents((events) => events.filter((event) => event.id !== id));
    }, 1000);
    eventTimersRef.current.push(timer);
  }, []);

  // Synced after every commit (before any timer can fire) so the battle loop's timers
  // always read the latest props without restarting.
  useLayoutEffect(() => {
    attackRef.current = attack;
    criticalDamageRef.current = criticalDamage;
    criticalChanceRef.current = criticalChance;
    goldBonusRef.current = goldBonus;
    missChanceRef.current = missChance;
    hitCountRef.current = hitCount;
    cooldownReductionRef.current = cooldownReductionMs;
    bossDamageRef.current = bossDamage;
    firstStrikeRef.current = firstStrikeMultiplier;
    extraHitChanceRef.current = extraHitChance;
    executeBonusRef.current = executeBonus;
    maxHpRef.current = enemyMaxHp;
    bossRef.current = boss;
    speedMultiplierRef.current = speedMultiplier;
    onDefeatRef.current = onDefeat;
    onBonusGoldRef.current = onBonusGold;
    onMissRef.current = onMiss;
    equippedSkillRef.current = equippedSkill;
    phaseRef.current = phase;
  });

  // Brings in the next enemy after a short entrance, then hands control back to auto.
  const enterEnemy = useCallback(() => {
    phaseRef.current = "entering";
    setPhase("entering");
    const readyTimer = setTimeout(() => {
      phaseRef.current = "idle";
      setPhase("idle");
      autoResumeRef.current?.();
    }, ENTER_DELAY / speedMultiplierRef.current);
    respawnTimersRef.current.push(readyTimer);
  }, []);

  const defeatEnemy = useCallback(() => {
    enemyEpochRef.current += 1;
    // Defeat always wins, cutting whatever pose timers were still in flight.
    clearTimers(manualTimersRef);
    clearTimers(respawnTimersRef);

    const reward = getGoldReward(attackRef.current, goldBonusRef.current, maxHpRef.current, bossRef.current);
    setLastGoldReward(reward);
    phaseRef.current = "defeated";
    setPhase("defeated");
    onDefeatRef.current(reward);

    const respawnTimer = setTimeout(() => {
      hpRef.current = maxHpRef.current;
      setEnemyHp(maxHpRef.current);
      setEnemyId((value) => value + 1);
      enterEnemy();
    }, (bossRef.current ? BOSS_RESPAWN_DELAY : MOB_RESPAWN_DELAY) / speedMultiplierRef.current);
    respawnTimersRef.current.push(respawnTimer);
  }, [enterEnemy]);

  // Lands one hit on the current enemy. Returns true if it killed it.
  const dealDamage = useCallback((damage: number, critical: boolean) => {
    pushDamageEvent(damage, critical);
    playSfx(critical ? "crit" : "hit");
    if (isSkillActive(skillTimersRef.current, "steal", Date.now())) {
      const killGold = getGoldReward(attackRef.current, goldBonusRef.current, maxHpRef.current, bossRef.current);
      const stolen = Math.round(killGold * STEAL_GOLD_RATIO);
      if (stolen > 0) {
        onBonusGoldRef.current(stolen);
        pushGoldEvent(stolen);
      }
    }
    let nextHp = Math.max(0, hpRef.current - damage);
    // Execute (passive): a hit that leaves the enemy low enough finishes it off.
    const executeRatio = EXECUTE_HP_RATIO + executeBonusRef.current / 100;
    const executed = equippedSkillRef.current === "execute" && nextHp > 0 && nextHp <= maxHpRef.current * executeRatio;
    if (executed) {
      nextHp = 0;
      setExecuteId((value) => value + 1);
    }
    hpRef.current = nextHp;
    setEnemyHp(nextHp);
    if (nextHp > 0) return false;
    setLastKillExecuted(executed);
    defeatEnemy();
    return true;
  }, [defeatEnemy, pushDamageEvent, pushGoldEvent]);

  // A normal attack's damage; Focus forces the crit, Shout makes the enemy take more.
  // missChance (e.g. tetoGini's drawback) is checked first — a miss skips the crit roll
  // entirely and deals no damage.
  const rollAttack = useCallback(() => {
    const now = Date.now();
    const missed = Math.random() * 100 < missChanceRef.current;
    if (missed) return { isCritical: false, damage: 0, missed: true, firstStrike: false };
    const shout = isSkillActive(skillTimersRef.current, "shout", now) ? 1 + SHOUT_DAMAGE_BONUS : 1;
    const bossBonus = bossRef.current ? 1 + bossDamageRef.current / 100 : 1;
    // First strike on a fresh enemy: a sure crit, worth `firstStrikeMultiplier` normal hits.
    if (firstStrikeRef.current > 0 && firstStrikeEpochRef.current !== enemyEpochRef.current) {
      firstStrikeEpochRef.current = enemyEpochRef.current;
      const damage = Math.round(attackRef.current * firstStrikeRef.current * (criticalDamageRef.current / 100) * shout * bossBonus);
      return { isCritical: true, damage, missed: false, firstStrike: true };
    }
    const isCritical =
      isSkillActive(skillTimersRef.current, "focus", now) ||
      Math.random() * 100 < Math.min(100, criticalChanceRef.current);
    const damage = Math.round(attackRef.current * (isCritical ? criticalDamageRef.current / 100 : 1) * shout * bossBonus);
    return { isCritical, damage, missed: false, firstStrike: false };
  }, []);

  // Strikes this swing lands: the outfit's hit count, plus one on a lucky extra-hit roll.
  const rollStrikes = useCallback(
    () => hitCountRef.current + (Math.random() * 100 < extraHitChanceRef.current ? 1 : 0),
    [],
  );

  useEffect(() => {
    if (!isAutoBattle) return;

    let active = true;
    const timers: Timer[] = [];
    const later = (callback: () => void, delay: number) => {
      const epoch = enemyEpochRef.current;
      const timer = setTimeout(
        () => active && epoch === enemyEpochRef.current && callback(),
        delay / speedMultiplierRef.current,
      );
      timers.push(timer);
    };

    const queueAttack = (delay: number) => {
      later(() => {
        // The enemy's mid death/respawn — enterEnemy resumes the loop once it's back.
        if (phaseRef.current === "defeated" || phaseRef.current === "entering") return;
        const { isCritical, damage, missed, firstStrike } = rollAttack();
        const strikes = rollStrikes();
        setLastCritical(isCritical);
        phaseRef.current = "attacking";
        setPhase("attacking");

        later(() => {
          // A miss never reaches dealDamage — no hp loss, no steal/execute. Extra strikes
          // (hitCount > 1, e.g. assassinGini's twin daggers) land right after, each rolling
          // its own miss/crit; an earlier kill skips the rest. The enemy's hit-reaction
          // (gated on phase "hit") only plays if at least one strike actually landed.
          let killed = false;
          let anyLanded = false;
          if (missed) {
            pushMissEvent();
          } else {
            anyLanded = true;
            if (firstStrike) setFirstStrikeId((value) => value + 1);
            if (dealDamage(damage, isCritical)) killed = true;
          }
          for (let i = 1; i < strikes && !killed; i++) {
            const extra = rollAttack();
            if (extra.missed) {
              pushMissEvent();
            } else {
              anyLanded = true;
              if (dealDamage(extra.damage, extra.isCritical)) killed = true;
            }
          }
          if (killed) return;
          if (anyLanded) {
            phaseRef.current = "hit";
            setPhase("hit");
          }
          later(() => {
            phaseRef.current = "idle";
            setPhase("idle");
            queueAttack(600);
          }, 320);
        }, 260);
      }, delay);
    };

    autoResumeRef.current = () => queueAttack(550);
    if (phaseRef.current !== "defeated" && phaseRef.current !== "entering") queueAttack(550);
    return () => {
      active = false;
      timers.forEach((timer) => clearTimeout(timer));
      autoResumeRef.current = null;
      // Switching auto off mid-swing drops the pose so manual taps aren't blocked; a
      // death/respawn in progress is left to finish on its own timers.
      if (phaseRef.current === "attacking" || phaseRef.current === "hit") {
        phaseRef.current = "idle";
        setPhase("idle");
      }
    };
  }, [isAutoBattle, dealDamage, pushMissEvent, rollAttack, rollStrikes]);

  const manualAttack = useCallback(() => {
    if (isAutoBattle) return;
    // Enemy is mid-death/respawn — nothing there to hit yet.
    if (phaseRef.current === "defeated" || phaseRef.current === "entering") return;

    // Damage always lands on tap, independent of the attack sprite's own pose cycle —
    // a burst of taps gets a burst of "-damage" popups instead of each tap fighting the
    // sprite for control and chopping its animation to pieces. Extra strikes (hitCount > 1)
    // land right away too; an earlier kill skips the rest.
    const { isCritical, damage, missed } = rollAttack();
    setLastCritical(isCritical);
    let killed = false;
    let anyLanded = false;
    if (missed) {
      pushMissEvent();
    } else {
      anyLanded = true;
      if (dealDamage(damage, isCritical)) killed = true;
    }
    const strikes = rollStrikes();
    for (let i = 1; i < strikes && !killed; i++) {
      const extra = rollAttack();
      if (extra.missed) {
        pushMissEvent();
      } else {
        anyLanded = true;
        if (dealDamage(extra.damage, extra.isCritical)) killed = true;
      }
    }
    if (killed) return;

    // Let an in-flight attack/hit pose play out; only kick off a fresh one once it's idle.
    if (phaseRef.current !== "idle") return;

    phaseRef.current = "attacking";
    setPhase("attacking");
    const hitTimer = setTimeout(() => {
      // Skip the hit-reaction pose if nothing landed — nothing for the enemy to react to.
      if (anyLanded) {
        phaseRef.current = "hit";
        setPhase("hit");
      }
      const readyTimer = setTimeout(() => {
        phaseRef.current = "idle";
        setPhase("idle");
      }, 320);
      manualTimersRef.current.push(readyTimer);
    }, 260);
    manualTimersRef.current.push(hitTimer);
  }, [isAutoBattle, dealDamage, pushMissEvent, rollAttack, rollStrikes]);

  // Whether the equipped skill can be cast right now (an active skill, off cooldown, with
  // an enemy present). `now` is passed in so the UI can re-check on its own clock.
  const canCastSkill = (now: number) => {
    if (!equippedSkill || getSkill(equippedSkill).passive) return false;
    if (skillTimers[equippedSkill].readyAt > now) return false;
    return phase !== "defeated" && phase !== "entering";
  };

  const castSkill = useCallback(() => {
    const id = equippedSkillRef.current;
    if (!id) return;
    const skill = getSkill(id);
    const now = Date.now();
    if (skill.passive || skillTimersRef.current[id].readyAt > now) return;
    if (phaseRef.current === "defeated" || phaseRef.current === "entering") return;

    const next = {
      ...skillTimersRef.current,
      [id]: {
        readyAt: now + Math.max(0, skill.cooldownMs - cooldownReductionRef.current),
        activeUntil: now + (skill.durationMs ?? 0),
      },
    };
    skillTimersRef.current = next;
    setSkillTimers(next);
    setCastIds((ids) => ({ ...ids, [id]: ids[id] + 1 }));
    setLastSkillCastAt(now);

    if (id === "beam") {
      // Damage waits for the beam to connect. If that enemy is gone by then (killed by a
      // normal hit, or a stage jump), the beam just fizzles.
      const epoch = enemyEpochRef.current;
      const hitTimer = setTimeout(() => {
        if (epoch !== enemyEpochRef.current) return;
        const damage = bossRef.current ? Math.ceil(maxHpRef.current * BEAM_BOSS_HP_RATIO) : hpRef.current;
        setLastCritical(true);
        dealDamage(damage, true);
      }, BEAM_TIMING.hit);
      eventTimersRef.current.push(hitTimer);
    }
  }, [dealDamage]);

  // A food buff (skillReset) makes the equipped skill ready to cast right now.
  const resetSkillCooldown = useCallback(() => {
    const id = equippedSkillRef.current;
    if (!id) return;
    const next = { ...skillTimersRef.current, [id]: { ...skillTimersRef.current[id], readyAt: 0 } };
    skillTimersRef.current = next;
    setSkillTimers(next);
  }, []);

  useEffect(() => {
    if (!isAutoBattle) return;
    clearTimers(manualTimersRef);
  }, [isAutoBattle]);

  useEffect(() => () => {
    clearTimers(manualTimersRef);
    clearTimers(respawnTimersRef);
    clearTimers(eventTimersRef);
  }, []);

  // Dev-convenience shortcut from the settings menu — deals the current enemy's full
  // remaining HP as one hit, so it dies through the normal kill flow (gold, drops, respawn)
  // instead of a separate ad-hoc path.
  const killEnemy = useCallback(() => {
    if (phaseRef.current === "defeated" || phaseRef.current === "entering") return;
    dealDamage(hpRef.current, false);
  }, [dealDamage]);

  const resetEnemy = useCallback((nextMaxHp: number) => {
    // The old enemy is gone: cancel its in-flight swing and any pending respawn, then
    // bring the new one in (which also restarts the auto loop).
    enemyEpochRef.current += 1;
    clearTimers(respawnTimersRef);
    hpRef.current = nextMaxHp;
    maxHpRef.current = nextMaxHp;
    setEnemyHp(nextMaxHp);
    setEnemyId((value) => value + 1);
    enterEnemy();
  }, [enterEnemy]);

  return {
    enemyHp,
    phase,
    isAutoBattle,
    enemyId,
    lastGoldReward,
    lastCritical,
    damageEvents,
    goldEvents,
    skillTimers,
    lastSkillCastAt,
    executeId,
    castIds,
    lastKillExecuted,
    setIsAutoBattle,
    resetEnemy,
    manualAttack,
    killEnemy,
    castSkill,
    canCastSkill,
    resetSkillCooldown,
    firstStrikeId,
    autoLocked,
  };
}
