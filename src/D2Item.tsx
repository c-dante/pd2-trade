import classNames from 'classnames';
import { FC } from 'react';
import type { Item, Settings, Stat } from './util';

interface ItemStatProps {
	stat: Stat;
};
const ItemStat: FC<ItemStatProps> = ({ stat }) => {
	const statClass = classNames('d2-item-stat', {
		'corrupted': stat.corrupted ? true : false,
	});
	const rangeSuffix = stat.range
		? (<span className="d2-item-range">[{stat.range.min} - {stat.range.max}]</span>)
		: null;

	if (stat.level !== undefined) {
		return (
			<span className={statClass}>{stat['chance%']}% to {stat.skill} {stat.name}{rangeSuffix}</span>
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
		<span className={statClass}>{value} {stat.name} {stat.skill ?? null}{rangeSuffix}</span>
	);
};

export interface D2ItemProps {
	item: Item;
	settings: Settings;
};

const applySettings = (item: Item, settings: Settings) => {
	if (settings.hideQuality[item.quality] === false) {
		return true;
	}
	if (settings.hideSockets[`${item.sockets ?? 0}`] === false) {
		return true;
	}
	if (item.set && settings.hideSets[item.set] === false) {
		return true;
	}
	if (item.type && settings.hideType[item.type] === false) {
		return true;
	}
	return false;
};

export const D2Item: FC<D2ItemProps> = ({ item, settings }) => (
	<div className={classNames('d2-item', {
		'hidden': applySettings(item, settings),
	})}>
		<span
			className={classNames('d2-item-name clickable', {
				'd2-item-eth': item.isEthereal ?? false,
			})}
			onClick={() => console.log(item)}>
			{item.name ?? item.type}
			{item.sockets !== undefined ? ` (${item.sockets})` : ''}
			{item.isEthereal ? ' [eth]' : ''}
		</span>
		<span className={classNames('d2-item-props', {
			'hidden': settings.hideProps,
		})}>
			<span className="d2-item-stat d2-item-type subtle">{item.type}</span>
			{item.defense && <span className="d2-item-stat">Defense: <span className="d2-item-value">{item.defense}</span></span>}
			{(item.stats ?? []).map((stat, i) => (
				<ItemStat stat={stat} key={i} />
			))}
		</span>
	</div>
);