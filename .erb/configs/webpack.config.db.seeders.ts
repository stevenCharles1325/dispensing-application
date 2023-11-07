import path from 'path';
import webpack from 'webpack';
import { merge } from 'webpack-merge';
import webpackPaths from './webpack.paths';
import baseConfig from './webpack.config.base';
import dotenv from 'dotenv';
import checkNodeEnv from '../scripts/check-node-env';

checkNodeEnv('production');

const glob = require('glob');

const migrationPath = path.resolve('src/main/database/seeders/*.ts');
const entry = glob.sync(migrationPath).reduce((entries, filename) => {
  const entityName = path.basename(filename, '.ts');
  return { ...entries, [entityName]: filename };
}, {});

const dbSeedersConfiguration: webpack.Configuration = {
  devtool: 'source-map',

  mode: 'production',

  target: 'electron-main',

  entry,

  resolve: {
    // assuming all your migration files are written in TypeScript
    extensions: ['.ts'],
  },

  output: {
    // change `path` to where you want to put transpiled migration files.
    path: `${webpackPaths.distPath}/database/seeders`,
    filename: '[name].js',
    // this is important - we want UMD (Universal Module Definition) for migration files.
    library: {
      type: 'umd',
    },
  },

  optimization: {
    minimize: false,
  },

  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production',
      DEBUG_PROD: false,
      START_MINIMIZED: false,
      ...dotenv.config().parsed,
    }),

    new webpack.DefinePlugin({
      'process.type': '"browser-db-seeders"',
    }),
  ],

  node: {
    __dirname: false,
    __filename: false,
  },
};

export default merge(baseConfig, dbSeedersConfiguration);
