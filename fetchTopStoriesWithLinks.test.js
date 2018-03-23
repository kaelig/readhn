const { fetchTopStoriesWithLinks, NUMBER_OF_STORIES } = require("./stories");

describe("fetchTopStoriesWithLinks", () => {
  it("Fetches top stories with links", () => {
    expect.assertions(1);
    return fetchTopStoriesWithLinks().then(stories => {
      expect(stories).toHaveLength(NUMBER_OF_STORIES);
    });
  });
  it("Fetches only a few stories when needed", () => {
    expect.assertions(1);
    return fetchTopStoriesWithLinks(3).then(stories => {
      expect(stories).toHaveLength(3);
    });
  });
});
