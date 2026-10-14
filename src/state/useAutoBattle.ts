import { useCallback, useEffect, useRef, useState } from "react";
import type { BattlePhase } from "../types";
import { getGoldReward } from "./gameMath";

// Player's win animation is 480ms/cycle and plays 3x on a boss kill (see BattleScene's
// PlayerFighter) — the defeated-phase delay needs to be at least that long so the
// celebration isn't cut short by the regular-mob respawn timing.
const BOSS_RESPAWN_DELAY = 1500;
const MOB_RESPAWN_DELAY = 650;

export function useAutoBattle({
  attack,
  criticalDamage,
  criticalChance,
  goldBonus,
  enemyMaxHp,
  boss,
  onDefeat,
}: {
  attack: number;
  criticalDamage: number;
  criticalChance: number;
  goldBonus: number;
  enemyMaxHp: number;
  boss: boolean;
  onDefeat: (goldReward: number) => void;
}) {
  const [enemyHp, setEnemyHp] = useState(enemyMaxHp);
  const [phase, setPhase] = useState<BattlePhase>("idle");
  const [isAutoBattle, setIsAutoBattle] = useState(true);
  const [enemyId, setEnemyId] = useState(1);
  const [lastGoldReward, setLastGoldReward] = useState(0);
  const [lastCritical, setLastCritical] = useState(false);
  const [damageEvents, setDamageEvents] = useState<{ id: number; amount: number; critical: boolean }[]>([]);
  const hpRef = useRef(enemyMaxHp);
  const phaseRef = useRef<BattlePhase>("idle");
  const attackRef = useRef(attack);
  const criticalDamageRef = useRef(criticalDamage);
  const criticalChanceRef = useRef(criticalChance);
  const goldBonusRef = useRef(goldBonus);
  const maxHpRef = useRef(enemyMaxHp);
  const bossRef = useRef(boss);
  const onDefeatRef = useRef(onDefeat);
  const manualTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const damageEventIdRef = useRef(0);
  const damageEventTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Every landed hit gets its own floating "-damage" popup, independent of whatever the
  // attack sprite animation is doing — so a burst of taps shows a burst of numbers instead
  // of fighting the sprite for control of a single shared instance.
  const pushDamageEvent = useCallback((amount: number, critical: boolean) => {
    const id = ++damageEventIdRef.current;
    setDamageEvents((events) => [...events, { id, amount, critical }]);
    const timer = setTimeout(() => {
      setDamageEvents((events) => events.filter((event) => event.id !== id));
    }, 700);
    damageEventTimersRef.current.push(timer);
  }, []);

  attackRef.current = attack;
  criticalDamageRef.current = criticalDamage;
  criticalChanceRef.current = criticalChance;
  goldBonusRef.current = goldBonus;
  maxHpRef.current = enemyMaxHp;
  bossRef.current = boss;
  onDefeatRef.current = onDefeat;
  phaseRef.current = phase;

  useEffect(() => {
    if (!isAutoBattle) {
      setPhase("idle");
      return;
    }

    let active = true;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const later = (callback: () => void, delay: number) => {
      const timer = setTimeout(() => active && callback(), delay);
      timers.push(timer);
    };

    const queueAttack = (delay: number) => {
      later(() => {
        const isCritical = Math.random() * 100 < Math.min(100, criticalChanceRef.current);
        setLastCritical(isCritical);
        setPhase("attacking");

        later(() => {
          const damage = Math.round(
            attackRef.current * (isCritical ? criticalDamageRef.current / 100 : 1),
          );
          pushDamageEvent(damage, isCritical);
          const nextHp = Math.max(0, hpRef.current - damage);
          hpRef.current = nextHp;
          setEnemyHp(nextHp);

          if (nextHp === 0) {
            const reward = getGoldReward(attackRef.current, goldBonusRef.current, maxHpRef.current, bossRef.current);
            setLastGoldReward(reward);
            setPhase("defeated");
            onDefeatRef.current(reward);

            later(() => {
              hpRef.current = maxHpRef.current;
              setEnemyHp(maxHpRef.current);
              setEnemyId((value) => value + 1);
              setPhase("entering");
              later(() => {
                setPhase("idle");
                queueAttack(550);
              }, 220);
            }, bossRef.current ? BOSS_RESPAWN_DELAY : MOB_RESPAWN_DELAY);
          } else {
            setPhase("hit");
            later(() => {
              setPhase("idle");
              queueAttack(600);
            }, 320);
          }
        }, 260);
      }, delay);
    };

    queueAttack(550);
    return () => {
      active = false;
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [isAutoBattle]);

  const manualAttack = useCallback(() => {
    if (isAutoBattle) return;
    // Enemy is mid-death/respawn — nothing there to hit yet.
    if (phaseRef.current === "defeated" || phaseRef.current === "entering") return;

    // Damage always lands on tap, independent of the attack sprite's own pose cycle —
    // a burst of taps gets a burst of "-damage" popups instead of each tap fighting the
    // sprite for control and chopping its animation to pieces.
    const isCritical = Math.random() * 100 < Math.min(100, criticalChanceRef.current);
    const damage = Math.round(
      attackRef.current * (isCritical ? criticalDamageRef.current / 100 : 1),
    );
    const nextHp = Math.max(0, hpRef.current - damage);
    setLastCritical(isCritical);
    pushDamageEvent(damage, isCritical);
    hpRef.current = nextHp;
    setEnemyHp(nextHp);

    if (nextHp === 0) {
      // Defeat always wins, cutting whatever pose timers were still in flight.
      manualTimersRef.current.forEach((timer) => clearTimeout(timer));
      manualTimersRef.current = [];

      const reward = getGoldReward(attackRef.current, goldBonusRef.current, maxHpRef.current, bossRef.current);
      setLastGoldReward(reward);
      phaseRef.current = "defeated";
      setPhase("defeated");
      onDefeatRef.current(reward);

      const respawnTimer = setTimeout(() => {
        hpRef.current = maxHpRef.current;
        setEnemyHp(maxHpRef.current);
        setEnemyId((value) => value + 1);
        phaseRef.current = "entering";
        setPhase("entering");

        const readyTimer = setTimeout(() => {
          phaseRef.current = "idle";
          setPhase("idle");
        }, 220);
        manualTimersRef.current.push(readyTimer);
      }, bossRef.current ? BOSS_RESPAWN_DELAY : MOB_RESPAWN_DELAY);
      manualTimersRef.current.push(respawnTimer);
      return;
    }

    // Let an in-flight attack/hit pose play out; only kick off a fresh one once it's idle.
    if (phaseRef.current !== "idle") return;

    phaseRef.current = "attacking";
    setPhase("attacking");
    const hitTimer = setTimeout(() => {
      phaseRef.current = "hit";
      setPhase("hit");
      const readyTimer = setTimeout(() => {
        phaseRef.current = "idle";
        setPhase("idle");
      }, 320);
      manualTimersRef.current.push(readyTimer);
    }, 260);
    manualTimersRef.current.push(hitTimer);
  }, [isAutoBattle]);

  useEffect(() => {
    if (!isAutoBattle) return;
    manualTimersRef.current.forEach((timer) => clearTimeout(timer));
    manualTimersRef.current = [];
  }, [isAutoBattle]);

  useEffect(() => () => {
    manualTimersRef.current.forEach((timer) => clearTimeout(timer));
    damageEventTimersRef.current.forEach((timer) => clearTimeout(timer));
  }, []);

  const resetEnemy = useCallback((nextMaxHp: number) => {
    hpRef.current = nextMaxHp;
    maxHpRef.current = nextMaxHp;
    setEnemyHp(nextMaxHp);
    setEnemyId((value) => value + 1);
    phaseRef.current = "entering";
    setPhase("entering");

    // Nothing else ever clears "entering" back to "idle" outside of a defeat's own timer
    // chain — without this, manualAttack's phase guard would block every tap forever
    // whenever resetEnemy (e.g. a milestone map stage jump) fires while not auto-battling.
    const readyTimer = setTimeout(() => {
      phaseRef.current = "idle";
      setPhase("idle");
    }, 220);
    manualTimersRef.current.push(readyTimer);
  }, []);

  return {
    enemyHp,
    phase,
    isAutoBattle,
    enemyId,
    lastGoldReward,
    lastCritical,
    damageEvents,
    setIsAutoBattle,
    resetEnemy,
    manualAttack,
  };
}
