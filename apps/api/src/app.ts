import { initArticlesService } from './api/articles/fetchArticlesData.js';
import { initBoostService } from './api/boosts/getBoosts.js';
import { initConfigService } from './api/config/getConfig.js';
import { initCowcentratedService } from './api/cowcentrated/index.js';
import { initOffchainRewardsService } from './api/offchain-rewards/index.js';
import { initPointsStructureService } from './api/points/getPointsStructures.js';
import { initProposalsService } from './api/snapshot/getProposals.js';
import { initPriceService } from './api/stats/getAmmPrices.js';
import { initApyService } from './api/stats/getApys.js';
import { initMooTokenPriceService } from './api/stats/getMooTokenPrices.js';
import { initVaultService } from './api/stats/getMultichainVaults.js';
import { initTvlService } from './api/stats/getTvl.js';
import { initTokenService } from './api/tokens/tokens.js';
import { initTreasuryService } from './api/treasury/getTreasury.js';
import { initValidatorPerformanceService } from './api/validators/validators.js';
import { initVaultFeeService } from './api/vaults/getVaultFees.js';
import { initZapSwapService } from './api/zap/swap/index.js';
import { initCache } from './utils/cache/index.js';

import cors from '@koa/cors';
import Koa from 'koa';
import body from 'koa-bodyparser';
import conditional from 'koa-conditional-get';
import etag from 'koa-etag';
import helmet from 'koa-helmet';

import powered from './middleware/powered.js';
import rt from './middleware/rt.js';
import router from './router.js';

const app = new Koa();

app.use(rt);
app.use(conditional());
app.use(etag());
app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(powered);
app.use(body());

app.context.cache = {};

app.use(router.routes());
app.use(router.allowedMethods());

const port = process.env.PORT || 3000;

const start = async () => {
  await initCache();

  initApyService();
  initPriceService();
  initValidatorPerformanceService();
  initVaultService();
  initBoostService();
  initVaultFeeService();
  initTvlService();
  initMooTokenPriceService();
  initTokenService();
  initConfigService();
  initProposalsService();
  initTreasuryService();
  initArticlesService();
  initZapSwapService();
  initCowcentratedService();
  initOffchainRewardsService();
  initPointsStructureService();

  app.listen(port);
  console.log(`> beefy-api running! (:${port})`);
};

start();
