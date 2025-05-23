import { createContext, useContext } from "react";
import type { FormState } from "./types";

export const ScenarioContext = createContext<{
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
} | null>(null);

export function useScenario() {
  const ctx = useContext(ScenarioContext);
  if (!ctx) {
    throw new Error("ScenarioContext not found");
  }
  return ctx;
}
