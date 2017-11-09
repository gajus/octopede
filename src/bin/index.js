#!/usr/bin/env node

import yargs from 'yargs';

yargs
  .env('OCTOPEDE')
  .commandDir('commands')
  .help()
  .wrap(80)
  .parse();
