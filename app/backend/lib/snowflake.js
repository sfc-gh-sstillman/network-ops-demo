import snowflake from 'snowflake-sdk'

const DB   = process.env.SNOWFLAKE_DATABASE  || 'TEMP'
const WH   = process.env.SNOWFLAKE_WAREHOUSE || 'APP_THOUGHTSPOT_OAUTH_WH'
const ROLE = process.env.SNOWFLAKE_ROLE      || 'PRODUCT_MANAGER'
const SCHEMA_ANALYTICS = `${DB}.NETWORK_OPS_ANALYTICS`

let pool

function getPool() {
  if (pool) return pool

  const isSpcs = process.env.SPCS_ENV === 'true'
  const connOpts = isSpcs
    ? { authenticator: 'OAUTH', token: () => require('fs').readFileSync('/snowflake/session/token', 'utf8').trim() }
    : process.env.SNOWFLAKE_PAT
      ? { authenticator: 'PROGRAMMATIC_ACCESS_TOKEN', token: process.env.SNOWFLAKE_PAT }
      : { authenticator: 'SNOWFLAKE_JWT', privateKeyPath: process.env.SNOWFLAKE_PRIVATE_KEY_PATH }

  const connection = snowflake.createPool({
    account:   process.env.SNOWFLAKE_ACCOUNT || 'snowhouse',
    username:  process.env.SNOWFLAKE_USER    || 'SSTILLMAN',
    warehouse: WH,
    database:  DB,
    schema:    'NETWORK_OPS_ANALYTICS',
    role:      ROLE,
    ...connOpts,
  }, { max: 10, min: 0, idleTimeoutMillis: 30_000 })

  pool = connection
  return pool
}

export async function query(sql, binds = []) {
  return new Promise((resolve, reject) => {
    getPool().use(async (conn) => {
      conn.execute({
        sqlText: sql,
        binds,
        complete: (err, _stmt, rows) => err ? reject(err) : resolve(rows)
      })
    })
  })
}

export { SCHEMA_ANALYTICS, DB, WH }
