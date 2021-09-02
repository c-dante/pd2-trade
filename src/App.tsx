import { FC, useEffect, useState } from 'react';
import './App.css';
import { useDropzone } from 'react-dropzone';
import { useAsync } from 'react-use';
import { Item, D2Item } from './D2Item';
import classNames from 'classnames';
import { defaultSettings } from './util';
import type { Settings } from './util';

interface FileLoad<T, E> {
  file: File;
  value?: T;
  error?: E;
}


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

  useEffect(() => {
    console.log(loading, error, value);
  }, [loading, error, value]);

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
          <h3>Filter Menu</h3>
          <label htmlFor="setting-hide-props">
            <input type="checkbox" id="setting-hide-props" checked={settings.hideProps} onChange={() => setSettings({ ...settings, hideProps: !settings.hideProps })} />
            Hide Props
          </label>
        </div>
      </div>
    </div >
  );
}

export default App;
