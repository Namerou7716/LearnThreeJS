import {defineConfig} from 'vite';

export default defineConfig({
    server:{
        //アプリを自動でブラウザで開く
        open:true,
    },
    build:{
        outDir:'dist',
        sourcemap:true,
    },
});