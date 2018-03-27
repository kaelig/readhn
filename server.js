"use strict";

const express = require("express");
const compression = require("compression");
const log = require("debug")("readhn");
const morgan = require("morgan");
const memjs = require("memjs").Client;

const { fetchTopStoriesWithLinks } = require("./stories");

const PORT = process.env.PORT || 3000;

// Set up memjs if Memcached Cloud is present
if (process.env.MEMCACHEDCLOUD_SERVERS) {
  process.env.MEMCACHIER_SERVERS =
    process.env.MEMCACHIER_SERVERS || process.env.MEMCACHEDCLOUD_SERVERS;
  process.env.MEMCACHIER_USERNAME =
    process.env.MEMCACHIER_USERNAME || process.env.MEMCACHEDCLOUD_USERNAME;
  process.env.MEMCACHIER_PASSWORD =
    process.env.MEMCACHIER_PASSWORD || process.env.MEMCACHEDCLOUD_PASSWORD;
}

// Set up caches
const STATIC_MAX_AGE =
  process.env.NODE_ENV === "production" ? 3600 * 24 * 365 : 0;
const MEMCACHE_AGE = 300; // seconds

// Load MemCached
let mjs = memjs.create();
mjs.stats((error, server, stats) => {
  if (error) {
    // Connection was unsuccessful, let's return a stub
    log("Could not connect to MemCache, falling back to a stub of mjs.");
    mjs = {
      get: (key, callback) => callback(null, false),
      set: (key, value, options, callback) => null
    };
  } else {
    log("Connection to MemCache successful", stats);
  }
});

const pug = require("pug");
const app = express();

app.use(compression());

// Request logging
app.use(morgan("dev"));

app.locals.MEMCACHE_AGE = MEMCACHE_AGE;

// Automatically redirect to https
app.set("trust proxy", "loopback");
app.use((req, res, next) => {
  if (req.secure || process.env.NODE_ENV !== "production") {
    // request was via https or handled locally, so do no special handling
    next();
  } else {
    // request was via http, so redirect to https
    res.redirect(`https://${req.headers.host + req.url}`);
  }
});

app.set("view engine", "pug");
app.use(express.static("public", { maxAge: STATIC_MAX_AGE }));

app.get("/", (req, res) =>
  mjs.get("hnstories", (err, cached) => {
    log(`Getting stories...`);
    if (cached) {
      log(`Loading cached stories: ${cached.toString()}...`);
      res.render("index", { stories: JSON.parse(cached) });
    } else {
      log(`Fetching stories from the API...`);
      fetchTopStoriesWithLinks()
        .then(stories => {
          mjs.set(
            "hnstories",
            JSON.stringify(stories),
            { expires: MEMCACHE_AGE },
            (err, val) => {
              if (err) {
                log(err);
              } else {
                log(`Caching stories: ${stories}`);
              }
            }
          );
          res.render("index", { stories });
        })
        .catch(reason => {
          log(reason);
          res.render("error", { reason });
        });
    }
  })
);

app.listen(PORT, () => {
  console.log(`App running on http://localhost:${PORT}`);
});
