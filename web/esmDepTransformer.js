// Jest transformer for react-router v8's ESM-only module graph under our
// CommonJS test setup (react-router itself and its `cookie-es` dependency).
//
// react-router v8 ships ESM only and includes a lone `import.meta.hot` HMR guard
// that never runs under jsdom. ts-jest can't help here: with `isolatedModules`
// it goes through `ts.transpileModule`, which neither strips `import.meta` nor
// runs custom AST transformers. So we transpile these packages' own sources with
// a tiny dedicated transformer — replace the `import.meta` meta-property with an
// empty object literal, then downlevel ESM to CommonJS with TypeScript (already
// a dependency). Scoped to those packages via the `transform` key in jest.config.
const ts = require("typescript");

module.exports = {
  process(sourceText, sourcePath) {
    const withoutImportMeta = sourceText.replace(/import\.meta/g, "({})");

    // Normalize the extension to `.ts`: TypeScript infers the module format
    // from the file extension, and an `.mjs` name (cookie-es) forces ESM output
    // regardless of `module: CommonJS`, leaving `export` statements in place.
    const fileName = sourcePath.replace(/\.[^./]+$/, ".ts");

    const { outputText } = ts.transpileModule(withoutImportMeta, {
      fileName,
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
      },
    });

    return { code: outputText };
  },
};
