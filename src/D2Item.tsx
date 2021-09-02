import classNames from 'classnames';
import { FC } from 'react';
import type { Settings } from './util';

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
};

export interface Item {
	name?: string;
	iLevel: number;
	quality: Quality;
	type: string;
	stats?: Stat[];
	// Based on type
	defense?: number;
	sockets?: number;
};

export interface D2SetItem extends Item {
	quality: 'Set';
	set: string;
};

interface ItemStatProps {
	stat: Stat;
};
const ItemStat: FC<ItemStatProps> = ({ stat }) => {
	const rangeSuffix = stat.range
		? (<span className="d2-item-range">[{stat.range.min} - {stat.range.max}]</span>)
		: null;

	if (stat.level !== undefined) {
		return (
			<span className="d2-item-stat">{stat['chance%']}% to {stat.skill} {stat.name}{rangeSuffix}</span>
		);
	}
	const value = (() => {
		if (stat.min !== undefined) {
			return <span className="d2-item-value">{stat.min} - {stat.max}</span>;
		}

		return stat.value
			? <span className="d2-item-value">{stat.value}</span>
			: null;
	})();
	return (
		<span className="d2-item-stat">{value} {stat.name} {stat.skill ?? null}{rangeSuffix}</span>
	);
};

export interface D2ItemProps {
	item: Item;
	settings: Settings;
};


export const D2Item: FC<D2ItemProps> = ({ item, settings }) => (
	<div className="d2-item">
		<span className="d2-item-name">{item.name ?? item.type}</span>
		<span className={classNames('d2-item-props', {
			'hidden': settings.hideProps,
		})}>
			<span className="d2-item-stat d2-item-type">{item.type}</span>
			{item.defense && <span className="d2-item-stat">Defense: <span className="d2-item-value">{item.defense}</span></span>}
			{(item.stats ?? []).map((stat, i) => (
				<ItemStat stat={stat} key={i} />
			))}
		</span>
	</div>
);