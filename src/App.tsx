import { Dispatch, FC, SetStateAction, useMemo, useState } from 'react';
import './App.css';
import { useDropzone } from 'react-dropzone';
import { useAsync } from 'react-use';
import { D2Item } from './D2Item';
import classNames from 'classnames';
import { defaultSettings, computeStats, emptyStats } from './util';
import type { Settings, Item, Stats } from './util';

interface FileLoad<T, E> {
  file: File;
  value?: T;
  error?: E;
};

interface StashProps {
  stash: FileLoad<Item[], any>;
  settings: Settings;
};

const Stash: FC<StashProps> = ({ stash, settings }) => {
  const [collapse, setCollapse] = useState(false);
  return (
    <div className="stash">
      <h3 className="stash-owner clickable" onClick={() => setCollapse(!collapse)}>
        {stash.file.name}
        <span style={{
          float: 'right',
        }}>{collapse ? 'Show' : 'Hide'}</span>
      </h3>
      {stash.error && <span className="stash-error">Oh no! {String(stash.error)}</span>}
      <span className={classNames('stash-items', {
        'hidden': collapse,
      })}>
        {(stash.value ?? []).map(
          (item, idx) => <D2Item item={item} key={idx} settings={settings} />
        )}
      </span>
    </div>
  );
};

interface FilterMenuProps {
  settings: Settings;
  setSettings: Dispatch<SetStateAction<Settings>>;
  stats: Stats;
}

const toId = (str: string) => str.toLowerCase().replace(/\W+/, ' ').replace(' ', '-');

interface VarFilterProps {
  prefix: string;
  map: Map<string, number>;
  toggles: Record<string, boolean>;
  onToggle: (value: string, newValue: boolean) => void;
}

const VarFilter: FC<VarFilterProps> = ({ prefix, map, toggles, onToggle }) => (
  <>
    {[...map.entries()].map(([value, count], i) => (
      <div key={i}>
        <label htmlFor={`${prefix}-${toId(value)}`}>
          <input
            type="checkbox"
            id={`${prefix}-${toId(value)}`}
            checked={toggles[value] ?? true}
            onChange={() => onToggle(value, !(toggles[value] ?? true))} />
          {value} <span className="subtle">({count})</span>
        </label>
      </div>
    ))}
  </>
);

const FilterMenu: FC<FilterMenuProps> = ({ settings, setSettings, stats }) => {
  return (
    <>
      <h3>Filter Menu</h3>
      <div>{stats.count} items</div>
      <div>
        <label htmlFor="setting-hide-props">
          <input type="checkbox" id="setting-hide-props" checked={settings.hideProps} onChange={() => setSettings({ ...settings, hideProps: !settings.hideProps })} />
          Hide Props
        </label>
      </div>

      <h4>Qualities</h4>
      <VarFilter
        prefix="setting-toggle-quality"
        map={stats.qualities}
        toggles={settings.hideQuality}
        onToggle={(type, newVal) => setSettings({
          ...settings,
          hideQuality: {
            ...settings.hideQuality,
            [type]: newVal
          }
        })}
      />

      <h4>Sockets</h4>
      <VarFilter
        prefix="setting-toggle-sockets"
        map={stats.sockets}
        toggles={settings.hideSockets}
        onToggle={(type, newVal) => setSettings({
          ...settings,
          hideSockets: {
            ...settings.hideSockets,
            [type]: newVal
          }
        })}
      />

      <h4>Sets</h4>
      <VarFilter
        prefix="setting-toggle-sets"
        map={stats.sets}
        toggles={settings.hideSets}
        onToggle={(type, newVal) => setSettings({
          ...settings,
          hideSets: {
            ...settings.hideSets,
            [type]: newVal
          }
        })}
      />

      <h4>Types</h4>
      <VarFilter
        prefix="setting-toggle-type"
        map={stats.types}
        toggles={settings.hideType}
        onToggle={(type, newVal) => setSettings({
          ...settings,
          hideType: {
            ...settings.hideType,
            [type]: newVal
          }
        })}
      />
    </>
  );
};

function App() {
  const [settings, setSettings] = useState(defaultSettings());

  const {
    acceptedFiles,
    getRootProps,
    getInputProps,
    isDragActive,
    open,
  } = useDropzone({
    accept: 'text/plain, application/json',
    noClick: true,
    noKeyboard: true,
  });

  const { loading, error, value } = useAsync(() => {
    // Load files
    const promises = acceptedFiles.map(file => new Promise<FileLoad<Item[], any>>((res) => {
      const reader = new FileReader();
      reader.onload = evt => {
        if (evt.target) {
          try {
            res({
              file,
              value: JSON.parse(String(evt.target.result)),
            });
          } catch (error) {
            res({
              file,
              error,
            });
          }
        }
      };
      reader.onerror = () => {
        res({
          file,
          error: reader.error,
        });
        reader.abort();
      };
      reader.readAsText(file);
    }));

    // Settle load
    return Promise.all(promises);
  }, [acceptedFiles]);

  const stats = useMemo(() => {
    if (!value) {
      return emptyStats();
    }

    return value.flatMap(
      v => v.value ?? []
    ).reduce(
      (acc, item) => computeStats(item, acc),
      emptyStats()
    );
  }, [value]);

  // console.log(settings, stats);

  return (
    <div className="App">
      <div {...getRootProps()} className="drop-zone">
        <input {...getInputProps()} />
        <p>{isDragActive ? 'drop files' : 'drop stash folder / export files'}</p>
        <button type="button" onClick={open}>Open Stash Files</button>
      </div>
      <div className={classNames('results-window', {
        'hidden': !value || value.length <= 0
      })}>
        <div className="stash-results">
          {loading ? 'Loading...' : ''}
          {error && JSON.stringify(error)}
          {value && value.map((stash, i) => (
            <Stash key={i} stash={stash} settings={settings} />
          ))}
        </div>
        <div className="filter-menu">
          <FilterMenu stats={stats} settings={settings} setSettings={setSettings} />
        </div>
      </div>
    </div >
  );
}

export default App;
