module.exports.postsByYear = (collection) => {
  const posts = collection.getFilteredByTag("post").reverse();
  const years = posts.map((post) => post.date.getFullYear());
  const uniqueYears = [...new Set(years)];

  const postsByYear = uniqueYears.reduce((prev, year) => {
    const filteredPosts = posts.filter(
      (post) => post.date.getFullYear() === year
    );

    return [...prev, [year, filteredPosts]];
  }, []);

  return postsByYear;
};
