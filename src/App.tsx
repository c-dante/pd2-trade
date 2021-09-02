import { useEffect } from 'react';
import './App.css';
import { useDropzone } from 'react-dropzone';
import { useAsync } from 'react-use';
import { Item, D2Item } from './D2Item';
import classNames from 'classnames';

interface FileLoad<T, E> {
  file: File;
  value?: T;
  error?: E;
}

function App() {
  // const onDrop = useCallback((files: File[]) => {
  //   files.forEach((file) => {
  //     const reader = new FileReader();
  //     console.log(file);
  //   });
  // }, []);

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
        'results-window-hidden': !value || value.length <= 0
      })}>
        <div className="stash-results">
          {loading ? 'Loading...' : ''}
          {error && JSON.stringify(error)}
          {value && value.map((stash, i) => (
            <div key={i} className="stash">
              <p className="stash-owner">{stash.file.name}</p>
              {stash.error && <span className="stash-error">Oh no! {String(stash.error)}</span>}
              {(stash.value ?? []).map(
                (item, idx) => <D2Item item={item} key={idx} />
              )}
            </div>
          ))}
        </div>
        <div className="filter-menu">Filter Menu</div>
      </div>
    </div >
  );
}

export default App;
