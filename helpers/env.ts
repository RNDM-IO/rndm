export const DETERMINISTIC_DEPLOYMENT = process.env.DETERMINISTIC_DEPLOYMENT
  ? process.env.DETERMINISTIC_DEPLOYMENT === "true"
  : null;

export const COMMON_DEPLOY_PARAMS = {
  log: true,
  deterministicDeployment: DETERMINISTIC_DEPLOYMENT ?? false,
};
