import path from 'path';
import { readFileSync } from 'fs';
import JsdomEnvironment from 'jest-environment-jsdom';
import { EnvironmentContext, JestEnvironmentConfig } from '@jest/environment';

import { BASE_URL } from './constants';

const phishingHtmlPath = path.resolve(__dirname, '..', 'static', 'index.html');
const phishingHtml = readFileSync(phishingHtmlPath, { encoding: 'utf8' });

class CustomEnvironment extends JsdomEnvironment {
  constructor(config: JestEnvironmentConfig, context: EnvironmentContext) {
    config.projectConfig.testEnvironmentOptions.html = phishingHtml;
    config.projectConfig.testEnvironmentOptions.url = BASE_URL;
    super(config, context);
  }
}

module.exports = CustomEnvironment;
