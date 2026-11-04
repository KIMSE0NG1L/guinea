import type { EnemyKind } from "../types";

// All three stun variants (stunned/sleep/confused) do the exact same thing mechanically
// (pause auto-battle — see useAutoBattle's autoStunned); same for both heal variants
// (holyAoe/bloom — add a share of current hp). Only the art and flavor name differ, picked
// per stage creature in BOSS_SKILLS below. See src/components/BossSkillEffect.tsx.
export type StunVariant = "stunned" | "sleep" | "confused";
export type HealVariant = "holyAoe" | "bloom";

export type BossSkill =
  | { kind: "stun"; variant: StunVariant; name: string }
  | { kind: "heal"; variant: HealVariant; name: string };

export type BossSkillCheckpoint = { hpRatio: number; chance: number };

// Three independent chances across the fight, each resolved once — the moment the boss's
// own hp first drops to that share of its max — not a random mid-fight event. Up to 3 casts
// in one fight (one per checkpoint); each checkpoint rolls once and is spent whether it
// hits or not, so a miss at 75% doesn't get a second shot there. The last one is pinned to
// 30% rather than 25% — EXECUTE_HP_RATIO (skills.ts) finishes an enemy off right at 25%, so
// 25% here would race an Execute-equipped kill and could lose every time.
export const BOSS_SKILL_CHECKPOINTS: BossSkillCheckpoint[] = [
  { hpRatio: 0.75, chance: 0.25 },
  { hpRatio: 0.5, chance: 0.5 },
  { hpRatio: 0.3, chance: 1 },
];
// Stun: how long auto-battle stays paused. At ~1.2s per swing this skips roughly 3-4 hits —
// noticeable, not a wipe, especially with manual tapping open the whole time.
export const BOSS_SKILL_STUN_MS = 4500;
// Heal: a flat share of the boss's *current* hp (not max) — so it's a real, roughly
// constant-feeling cost whenever it lands, not a huge swing early or a non-event late. The
// hp change itself is instant, the moment the skill fires; the visual's own lifetime (ring/
// bloom, fading out after it finishes playing) is self-timed in BossSkillEffect.tsx.
export const BOSS_SKILL_HEAL_RATIO = 0.12;

// 밤의 실크로드's boss (enemyKind "lizard" — the stage's own story text calls it a
// ghost-possessed goat, see stages.ts) comes back from the dead once a fight, guaranteed —
// not part of the probabilistic BOSS_SKILLS table above, always on for this one boss. See
// useAutoBattle's reviveHpRatio/reviveId and useGameState's wiring of both.
export const GHOST_GOAT_REVIVE_KIND: EnemyKind = "lizard";
export const GHOST_GOAT_REVIVE_HP_RATIO = 0.5;
export const GHOST_GOAT_REVIVE_NAME = "부활";

// One skill per stage's creature — see src/state/stages.ts for what each one actually is.
export const BOSS_SKILLS: Record<EnemyKind, BossSkill> = {
  slime: { kind: "stun", variant: "confused", name: "점액 분사" },
  mushroom: { kind: "stun", variant: "sleep", name: "수면 포자" },
  carrot: { kind: "heal", variant: "bloom", name: "뿌리 흡수" },
  chicken: { kind: "stun", variant: "confused", name: "깃털 먼지" },
  potato: { kind: "heal", variant: "bloom", name: "감자 싹" },
  mouse: { kind: "stun", variant: "stunned", name: "우당탕" },
  cauldron: { kind: "heal", variant: "holyAoe", name: "비약 끓이기" },
  mudskipper: { kind: "stun", variant: "confused", name: "진흙 튀기기" },
  bluefish: { kind: "stun", variant: "confused", name: "물보라" },
  salamander: { kind: "heal", variant: "holyAoe", name: "용암욕" },
  monkey: { kind: "stun", variant: "confused", name: "바나나 투척" },
  carp: { kind: "stun", variant: "stunned", name: "힘찬 점프" },
  cactus: { kind: "heal", variant: "bloom", name: "선인장 개화" },
  fox: { kind: "stun", variant: "confused", name: "홀리기" },
  lizard: { kind: "stun", variant: "confused", name: "밤안개" },
  mantou: { kind: "heal", variant: "holyAoe", name: "뜨끈한 김" },
  pig: { kind: "stun", variant: "stunned", name: "낫질" },
  snowRabbit: { kind: "stun", variant: "stunned", name: "얼음창" },
  magpie: { kind: "stun", variant: "confused", name: "깃털 흩날리기" },
  drunkCat: { kind: "stun", variant: "confused", name: "술기운" },
  flowerSnake: { kind: "heal", variant: "bloom", name: "꽃잎 모으기" },
  riceSack: { kind: "stun", variant: "stunned", name: "데굴데굴" },
  mackerel: { kind: "stun", variant: "confused", name: "물첨벙" },
  blossomCrab: { kind: "heal", variant: "bloom", name: "벚꽃잎 모으기" },
  shrineFox: { kind: "heal", variant: "holyAoe", name: "여우불 기원" },
  armorBeetle: { kind: "stun", variant: "stunned", name: "뿔 박치기" },
  onsenMonkey: { kind: "heal", variant: "holyAoe", name: "온천욕" },
  ninjaFrog: { kind: "stun", variant: "confused", name: "연막탄" },
  lanternAngler: { kind: "stun", variant: "sleep", name: "홀리는 빛" },
  clamMaid: { kind: "heal", variant: "holyAoe", name: "진주 기운" },
  gondolaDuck: { kind: "stun", variant: "confused", name: "물보라" },
  bellCalf: { kind: "stun", variant: "stunned", name: "방울 소리" },
  croissantKid: { kind: "heal", variant: "holyAoe", name: "갓 구운 온기" },
  sleepyGini: { kind: "stun", variant: "sleep", name: "낮잠 기운" },
  sleepwalkerGini: { kind: "stun", variant: "confused", name: "몽유병" },
  candyBasketSlime: { kind: "heal", variant: "bloom", name: "호박등의 온기" },
  bee: { kind: "stun", variant: "confused", name: "벌떼 돌진" },
};

export function getBossSkill(kind: EnemyKind): BossSkill {
  return BOSS_SKILLS[kind];
}
