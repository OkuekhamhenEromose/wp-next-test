/**
 * pages/index.js — Home page.
 *
 * Composes all four parts of the assessment on a single page:
 *   Part 1 — WordPress blog posts via GraphQL (SiteHeader, PostList, ToggleButton)
 *   Part 2 — NGN → USD exchange rate via external REST API (ExchangeRate)
 *   Part 3 — EDD store currency via WordPress REST API (EddSettings)
 *   Part 4 — Custom name form via WordPress custom REST API (NameForm)
 */

import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';

import { fetchAllPosts, fetchSiteSettings } from '../lib/api/posts';
import { fetchExchangeRate }               from '../lib/api/exchange';
import { fetchEddSettings }                from '../lib/api/edd';

import SiteHeader    from '../components/SiteHeader';
import PostList      from '../components/PostList';
import ToggleButton  from '../components/ToggleButton';
import ExchangeRate  from '../components/ExchangeRate';
import EddSettings   from '../components/EddSettings';
import NameForm      from '../components/NameForm';

const RECENT_COUNT = 3;

export default function HomePage() {
  // Part 1
  const [allPosts,     setAllPosts]   = useState([]);
  const [settings,     setSettings]   = useState(null);
  const [postsLoading, setPostsLoad]  = useState(true);
  const [postsError,   setPostsErr]   = useState(null);
  const [showAll,      setShowAll]    = useState(false);

  // Part 2
  const [rateData,    setRateData]  = useState(null);
  const [rateLoading, setRateLoad]  = useState(true);
  const [rateError,   setRateErr]   = useState(null);

  // Part 3
  const [eddData,    setEddData]  = useState(null);
  const [eddLoading, setEddLoad]  = useState(true);
  const [eddError,   setEddErr]   = useState(null);

  const loadData = useCallback(async () => {
    setPostsLoad(true);
    setRateLoad(true);
    setEddLoad(true);

    const [postsResult, settingsResult, rateResult, eddResult] = await Promise.all([
      fetchAllPosts(),
      fetchSiteSettings(),
      fetchExchangeRate(),
      fetchEddSettings(),
    ]);

    // Part 1
    if (postsResult.error) { setPostsErr(postsResult.error); setAllPosts([]); }
    else setAllPosts(postsResult.data ?? []);
    if (settingsResult.data) setSettings(settingsResult.data);
    setPostsLoad(false);

    // Part 2
    if (rateResult.error) setRateErr(rateResult.error);
    else setRateData(rateResult.data);
    setRateLoad(false);

    // Part 3
    if (eddResult.error) setEddErr(eddResult.error);
    else setEddData(eddResult.data);
    setEddLoad(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const visiblePosts = showAll ? allPosts : allPosts.slice(0, RECENT_COUNT);
  const hasMorePosts = allPosts.length > RECENT_COUNT;

  return (
    <>
      <Head>
        <title>{settings?.title ?? 'WP Headless Test'}</title>
        <meta name="description" content={settings?.description ?? 'Next.js + WordPress headless CMS assessment'} />
      </Head>

      <main className="main-container">

        <SiteHeader settings={settings} />

        {/* Part 1 — Blog posts */}
        <section className="posts-section" aria-labelledby="posts-heading">
          <div className="posts-header">
            <h2 id="posts-heading" className="posts-heading">
              {showAll ? 'All Posts' : 'Recent Posts'}
              {!postsLoading && !postsError && (
                <span className="posts-count">
                  &nbsp;({visiblePosts.length}{!showAll && hasMorePosts ? ` of ${allPosts.length}` : ''})
                </span>
              )}
            </h2>
            {!postsLoading && !postsError && hasMorePosts && (
              <ToggleButton
                showAll={showAll}
                onToggle={() => setShowAll(p => !p)}
                totalCount={allPosts.length}
              />
            )}
          </div>
          <PostList posts={visiblePosts} isLoading={postsLoading} error={postsError} />
          {postsError && !postsLoading && (
            <button className="retry-btn" onClick={loadData}>↺ Retry</button>
          )}
        </section>

        {/* Parts 2 & 3 — Widgets grid */}
        <div className="widgets-grid">
          <ExchangeRate data={rateData} isLoading={rateLoading} error={rateError} />
          <EddSettings  data={eddData}  isLoading={eddLoading}  error={eddError}  />
        </div>

        {/* Part 4 — Name form */}
        <NameForm />

      </main>
    </>
  );
}