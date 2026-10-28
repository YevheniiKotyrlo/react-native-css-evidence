/* eslint-disable */
// Render cost of the paths #412 changes. Save as src/__tests__/native/render-cost.test.tsx on main and on the branch, then run
// `yarn jest src/__tests__/native/render-cost.test.tsx` a few times on each: every case prints µs per operation, the median of 7 samples.
import tailwind from "@tailwindcss/postcss";
import { render, screen } from "@testing-library/react-native";
import postcss from "postcss";
import { VariableContextProvider } from "react-native-css";
import { Text } from "react-native-css/components/Text";
import { View } from "react-native-css/components/View";
import { registerCSS } from "react-native-css/jest";
import { vars } from "react-native-css/runtime";

import { updateRules } from "../../native/react/rules";
import { VAR_SYMBOL, type Effect } from "../../native/reactivity";

const SAMPLES = 7;

const classes = ["ring-2", "ring-4", "ring-red-500", "ring-blue-500", "rounded-md", "rounded-lg", "p-2", "p-4"]
  .concat(["shadow-sm", "shadow-md", "shadow-none", "bg-white", "text-gray-900", "font-semibold"]);

let css = "";

beforeAll(async () => {
  const input = [
    `@import "tailwindcss/theme.css" layer(theme);`,
    `@import "tailwindcss/utilities.css" layer(utilities) source(none);`,
    `@source inline("${classes.join(" ")}");`,
  ].join("\n");
  const { css: output } = await postcss([tailwind({ base: Date.now().toString() })]).process(input, { from: __dirname });
  css = `${output}\n.brand { background-color: var(--brand); }\n.fallback { width: var(--missing, 10px); }\n`;
});

function ringedCard(ring: string, shadow: string) {
  return (
    <View className={`${ring} rounded-lg p-4`}>
      <View className={`${shadow} rounded-md bg-white p-2`}>
        <Text className="text-gray-900 font-semibold">Title</Text>
      </View>
      <View className="shadow-none p-2" />
    </View>
  );
}

const shadowedCard = (
  <View className="shadow-sm rounded-md bg-white p-2">
    <Text className="text-gray-900 font-semibold">Title</Text>
  </View>
);

const rootVariables = { [VAR_SYMBOL]: true } as const;

function componentState(props: Record<string, unknown>, inheritedVariables: object) {
  const effect = (): Effect => ({ observers: new Set(), run: () => undefined });
  const ruleEffect = effect();
  return updateRules(
    {
      ruleEffect,
      ruleEffectGetter: (observable) => observable.get(ruleEffect),
      styleEffect: effect(),
      configs: [{ source: "className", target: "style" }],
      inheritedContainers: {},
      inheritedVariables: inheritedVariables as never,
      pressable: false,
    },
    props,
    inheritedVariables as never,
    {},
    false,
    false,
  );
}

function rulesUpdate(propsFor: (index: number) => Record<string, unknown>) {
  let state = componentState(propsFor(0), rootVariables);
  return (index: number) => {
    state = updateRules(state, propsFor(index), rootVariables as never, {}, true);
  };
}

function stylesRecompute(props: Record<string, unknown>, inheritedVariables: object) {
  const state = componentState(props, inheritedVariables);
  state.stylesObs!.get({ observers: new Set(), run: () => undefined });
  return () => state.stylesObs!.run();
}

const brandColours = ["red", "blue"] as const;
const brandValues = brandColours.map((colour) => ({ "--brand": colour }));
const ring = (index: number) => (index % 2 ? "ring-4 ring-blue-500" : "ring-2 ring-red-500");

const cases: Record<string, readonly [operations: number, setUp: () => (index: number) => void]> = {
  "mount: a ringed card, a shadowed child and its text": [500, () => () => render(ringedCard("ring-2 ring-red-500", "shadow-sm")).unmount()],
  "mount: a shadowed card alone": [900, () => () => render(shadowedCard).unmount()],
  "mount: a var() with a fallback nothing sets": [2800, () => () => render(<View className="fallback" />).unmount()],
  "update: the parent's ring changes": [1000, () => {
    render(ringedCard(ring(0), "shadow-sm"));
    return (index) => screen.rerender(ringedCard(ring(index), "shadow-sm"));
  }],
  "update: the child's shadow changes under a ring": [1300, () => {
    render(ringedCard("ring-2 ring-red-500", "shadow-sm"));
    return (index) => screen.rerender(ringedCard("ring-2 ring-red-500", index % 2 ? "shadow-md" : "shadow-sm"));
  }],
  "update: an inline vars() that changes": [3000, () => {
    const tree = (index: number) => (
      <View className="p-4" style={vars({ "--brand": brandColours[index % 2]! })}>
        <View className="brand p-2" />
      </View>
    );
    render(tree(0));
    return (index) => screen.rerender(tree(index));
  }],
  "update: a VariableContextProvider value that changes": [5000, () => {
    const tree = (index: number) => (
      <VariableContextProvider value={brandValues[index % 2]!}>
        <View className="brand p-2" />
      </VariableContextProvider>
    );
    render(tree(0));
    return (index) => screen.rerender(tree(index));
  }],
  "updateRules: a ring's variables published": [10000, () => rulesUpdate((index) => ({ className: ring(index) }))],
  "updateRules: an inline vars()": [25000, () =>
    rulesUpdate((index) => ({ className: "brand p-2", style: vars({ "--brand": brandColours[index % 2]! }) }))],
  "styles: the shadow composition with no ring above": [10000, () => stylesRecompute({ className: "shadow-sm" }, rootVariables)],
  "styles: the shadow composition under a ring": [10000, () =>
    stylesRecompute({ className: "shadow-sm" }, componentState({ className: "ring-2 ring-red-500" }, rootVariables).variables ?? rootVariables)],
  "styles: a var() with a fallback nothing sets": [70000, () => stylesRecompute({ className: "fallback" }, rootVariables)],
};

const median = (values: readonly number[]) => [...values].sort((left, right) => left - right)[Math.floor(values.length / 2)]!;
const developmentEnvironment = process.env.NODE_ENV;

afterEach(() => {
  process.env.NODE_ENV = developmentEnvironment;
});

test.each(Object.keys(cases))("%s", (name) => {
  const [operations, setUp] = cases[name]!;
  registerCSS(css);
  // The production path a release build runs: in development every update of an inline vars() logs a re-mount warning (#469)
  process.env.NODE_ENV = "production";
  const operation = setUp();
  for (let index = 1; index <= operations / 10; index++) operation(index);

  const microseconds: number[] = [];
  for (let sample = 0; sample < SAMPLES; sample++) {
    const start = process.hrtime.bigint();
    for (let index = 1; index <= operations; index++) operation(index);
    microseconds.push(Number(process.hrtime.bigint() - start) / 1000 / operations);
  }

  console.log(`${name}: ${median(microseconds).toFixed(2)} µs`);
});
