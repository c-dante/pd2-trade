export type Quality = 'Magic' | 'Unique' | 'Set' | 'Normal';

export interface Stat {
	name: string;

	// Skills?
	skill?: string;

	// Proc
	'chance%'?: number;
	level?: number;

	// Value
	value?: number;

	// Range
	range?: { min: number, max: number };

	// Damage range
	min?: number;
	max?: number;

	// Corrupted flag
	corrupted?: number;
};

export interface SocketItem {
	iLevel: number;
	quality: Quality;
	type: string;
	isGem?: boolean;
	isRune?: boolean;
}

export interface Item {
	name?: string;
	iLevel: number;
	quality: Quality;
	type: string;
	stats?: Stat[];

	// Based on type
	defense?: number;
	sockets?: number;
	socketed?: SocketItem[];
	isEthereal?: boolean;

	// Set item
	set?: string;

	// Runeword
	runeword?: string;
	isRuneword?: boolean;
};

export const defaultSettings = () => ({
	hideProps: false,
	hideType: {} as Record<string, boolean>,
	hideQuality: {} as Record<string, boolean>,
	hideSets: {} as Record<string, boolean>,
	hideSockets: {} as Record<string, boolean>,
});

export type Settings = ReturnType<typeof defaultSettings>;


export const emptyStats = () => ({
	types: new Map<string, number>(),
	qualities: new Map<string, number>(),
	sets: new Map<string, number>(),
	sockets: new Map<string, number>(),
	count: 0,
});
export type Stats = ReturnType<typeof emptyStats>;

const tally = (map: Map<string, number>, value: string) => {
	map.set(
		value,
		(map.get(value) ?? 0) + 1
	);
};

export const computeStats = (item: Item, mutStat: Stats = emptyStats()) => {
	tally(mutStat.types, item.type);
	tally(mutStat.qualities, item.quality);
	if (item.set) tally(mutStat.sets, item.set);
	tally(mutStat.sockets, `${item.sockets ?? 0}`);
	mutStat.count++;
	return mutStat;
};
