import ApiStatus from "../ApiStatus";
import ScenarioControls from "./ScenarioControls";

export default function Header() {
  return (
    <header className="flex items-start justify-between py-4">
      <div>
        <h1 className="main-header">SMB Program Modeling</h1>
        <p className="sub-header">Carbon Removal Subscription Service</p>
      </div>
      <div className="flex flex-col items-end gap-2">
        <ApiStatus />
        <ScenarioControls />
      </div>
    </header>
  );
}
