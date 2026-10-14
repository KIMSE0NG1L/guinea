import type { SkillId } from "../types";

export type { SkillId };

export type Skill = {
  id: SkillId;
  name: string;
  description: string;
  // Passive skills are never cast — they just apply while equipped.
  passive?: boolean;
  cooldownMs: number;
  // Buff-style skills stay active this long after casting; instant skills omit it.
  durationMs?: number;
};

const SECOND = 1000;

// Beam wipes out a regular mob outright; against a boss it takes this share of max HP.
export const BEAM_BOSS_HP_RATIO = 0.5;
// Guinea Beam timeline (ms from the cast), shared by the battle logic and BeamEffect:
// charge up → beam fires → damage lands → everything has faded.
export const BEAM_TIMING = { fire: 240, hit: 370, end: 900 };
// While Steal is active, every hit scatters this share of the enemy's kill gold.
export const STEAL_GOLD_RATIO = 0.1;
// With Execute equipped, any hit that leaves the enemy at or below this share of its
// max HP finishes it off.
export const EXECUTE_HP_RATIO = 0.25;
// While Shout is active, the enemy takes this much more damage from normal attacks.
export const SHOUT_DAMAGE_BONUS = 0.3;
// With Diligent Guinea equipped, offline gold is boosted by this much.
export const DILIGENT_OFFLINE_BONUS = 0.5;
// With Glutton equipped, food buffs eaten last this many times longer.
export const GLUTTON_FOOD_MULTIPLIER = 2;
// After casting a skill — or putting a passive in the slot — the slot can't change for this
// long, so you can't chain several skills' cooldowns or flick passives on and off.
export const SKILL_SWAP_LOCK_MS = 3 * 60 * SECOND;
// Every active skill shares the same cooldown.
const SKILL_COOLDOWN_MS = 3 * 60 * SECOND;

export const SKILLS: Skill[] = [
  { id: "beam", name: "기니빔", description: "일반 몹은 즉사, 보스는 최대 체력의 50%를 깎아요.", cooldownMs: SKILL_COOLDOWN_MS },
  { id: "steal", name: "훔치기", description: "5초 동안 때릴 때마다 처치 골드의 10%를 뿌려요.", cooldownMs: SKILL_COOLDOWN_MS, durationMs: 5 * SECOND },
  { id: "focus", name: "집중", description: "5초 동안 치명타 확률이 100%가 돼요.", cooldownMs: SKILL_COOLDOWN_MS, durationMs: 5 * SECOND },
  { id: "execute", name: "처형", description: "장착하면 항상 적용 · 체력 25% 이하가 된 적을 즉사시켜요.", passive: true, cooldownMs: 0 },
  { id: "shout", name: "찍찍 함성", description: "30초 동안 적이 받는 일반 공격 피해가 30% 늘어나요.", cooldownMs: SKILL_COOLDOWN_MS, durationMs: 30 * SECOND },
  {
    id: "diligent",
    name: "부지런한 기니",
    description: "장착하면 항상 적용 · 오프라인 골드 +50%.",
    passive: true,
    cooldownMs: 0,
  },
  { id: "glutton", name: "먹보", description: "장착하면 항상 적용 · 장착 중에 먹은 음식 버프가 2배로 오래가요.", passive: true, cooldownMs: 0 },
];

export function getSkill(id: SkillId) {
  return SKILLS.find((skill) => skill.id === id)!;
}

export type SkillTimers = Record<SkillId, { readyAt: number; activeUntil: number }>;

export const INITIAL_SKILL_TIMERS: SkillTimers = {
  beam: { readyAt: 0, activeUntil: 0 },
  steal: { readyAt: 0, activeUntil: 0 },
  focus: { readyAt: 0, activeUntil: 0 },
  execute: { readyAt: 0, activeUntil: 0 },
  shout: { readyAt: 0, activeUntil: 0 },
  diligent: { readyAt: 0, activeUntil: 0 },
  glutton: { readyAt: 0, activeUntil: 0 },
};

export function isSkillActive(timers: SkillTimers, id: SkillId, now: number) {
  return timers[id].activeUntil > now;
}
