
import * as esbuild from 'esbuild';
import { build as unoBuild } from '@unocss/cli';
import { consola } from "consola";  // it just comes with @unocss/cli, so why not use it
import fs from 'fs';

function copyNeededFiles() {
    // copy needed files to the dist folder
}

const operation = process.argv[2] ?? 'dev';

if (operation == 'dev') {
    await unoBuild({
        config: "unocss.config.ts",
        outFile: "./devtemp/uno.css",
        patterns: [
            "packages/web-core/**/*.tsx",
        ],
        watch: true
    })

    const ctx = await esbuild.context({
        entryPoints: [
            'packages/web-core/index.html',
            'packages/web-core/entry.ts',
        ],
        bundle: true,
        outdir: 'devtemp',
        write: false,
        format: 'esm',
        sourcemap: true,
        loader: {
            ".tsx": "tsx",
            ".html": "copy",
            ".css": "css"
        },
        banner: {
            js: `new EventSource('/esbuild').addEventListener('change', e => {
                const { added, removed, updated } = JSON.parse(e.data)
              
                if (!added.length && !removed.length && updated.length === 1) {
                  for (const link of document.getElementsByTagName("link")) {
                    const url = new URL(link.href)
              
                    if (url.host === location.host && url.pathname === updated[0]) {
                      const next = link.cloneNode()
                      next.href = updated[0] + '?' + Math.random().toString(36).slice(2)
                      next.onload = () => link.remove()
                      link.parentNode.insertBefore(next, link.nextSibling)
                      return
                    }
                  }
                }

                location.reload()
              }) `
        },

        plugins: [],
    });

    await ctx.watch();

    let { port } = await ctx.serve({
        servedir: 'devtemp/',
    });

    consola.info(`Serving on http://localhost:${port}`);

} else if (operation == 'release') {

    await unoBuild({
        config: "unocss.config.ts",
        outFile: "./devtemp/uno.css",
        patterns: [
            "packages/web-core/**/*.html",
            "packages/web-core/**/*.ts",
            "packages/web-core/**/*.tsx",
        ],
    })

    await esbuild.build({
        entryPoints: [
            'packages/web-core/index.html',
            'packages/web-core/entry.ts',
        ],
        bundle: true,
        outdir: 'dist',
        format: 'esm',
        minify: true,
        keepNames: true,
        loader: {
            ".tsx": "tsx",
            ".html": "copy",
            ".css": "css"
        },
        plugins: [],
    });

}

process.on('SIGINT', () => {
    fs.unlink("devtemp/uno.css", (err) => {
        if (err) throw err;
    });
    consola.log('Temp file cleaned.');
    process.exit();
});
