require('dotenv').config();
const { IgApiClient } = require('instagram-private-api');
const ig = new IgApiClient();

async function getAllItemsFromFeed(feed) {
  const items = [];
  do {
    const chunk = await feed.items();
    items.push(...chunk);
  } while (feed.isMoreAvailable());
  return items;
}

(async () => {
  // Login to Instagram
  ig.state.generateDevice(process.env.INSTAGRAM_USERNAME);
  await ig.simulate.preLoginFlow();
  const loggedInUser = await ig.account.login(process.env.INSTAGRAM_USERNAME, process.env.INSTAGRAM_PASSWORD);

  // Fetch the list of users you follow
  const followingFeed = ig.feed.accountFollowing(loggedInUser.pk);
  const followingUsers = await getAllItemsFromFeed(followingFeed);

  // Fetch the list of users following you
  const followersFeed = ig.feed.accountFollowers(loggedInUser.pk);
  const followersUsers = await getAllItemsFromFeed(followersFeed);

  // Create sets of user IDs for easier comparison
  const followingIds = new Set(followingUsers.map(user => user.pk));
  const followersIds = new Set(followersUsers.map(user => user.pk));

  // Find users who don't follow you back
  const nonFollowers = followingUsers.filter(user => !followersIds.has(user.pk));

  // Output the list of non-followers
  console.log("Users not following you back:");
  nonFollowers.forEach(user => console.log(`- ${user.username}`));

  process.exit(0);
})();

