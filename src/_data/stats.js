// Personal stats for the homepage stat grid
module.exports = function () {
  // Security career started Feb 2021 (CyberFit Security)
  const startDate = new Date("2021-02-01");
  const now = new Date();
  const yearsInSecurity = Math.floor(
    (now - startDate) / (1000 * 60 * 60 * 24 * 365.25)
  );

  return {
    yearsInSecurity,
    // Completed certs & quals: SC-200, Google Cybersecurity,
    // Jira Fundamentals, L3 Extended Diploma CompSci.
    // CISSP is pending — not counted until passed.
    certifications: 4,
  };
};
