import { Theme } from './settings/types';
import { ReUIDataGridAdvanced11 } from './components/generated/ReUIDataGridAdvanced11';

let theme: Theme = 'dark';

function App() {
  function setTheme(theme: Theme) {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  setTheme(theme);

  return (
    <>
      <ReUIDataGridAdvanced11 />
    </>
  ); // %EXPORT_STATEMENT%
}

export default App;
