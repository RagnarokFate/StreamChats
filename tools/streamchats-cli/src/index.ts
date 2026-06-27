#!/usr/bin/env node

import { Command } from 'commander';
import { createPluginCommand } from './commands/create-plugin';
import { simulateCommand } from './commands/simulate';

const program = new Command();

program
  .name('streamchats')
  .description('CLI tool for StreamChats aggregator plugin development and utilities')
  .version('1.0.0');

program.addCommand(createPluginCommand);
program.addCommand(simulateCommand);

program.parse(process.argv);
