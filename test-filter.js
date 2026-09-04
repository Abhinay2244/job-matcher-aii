const resumeText = "I know Python, javascript, and Data Structures, backend, api";

const skillTagMap = {
  python: ['python'],
  javascript: ['javascript', 'js', 'node', 'nodejs'],
  backend: ['backend', 'api', 'nodejs'],
  api: ['api'],
  java: ['java'],
  sql: ['sql'],
};

const resumeLower = resumeText.toLowerCase();
const resumeWords = resumeLower.split(/\W+/);
console.log('Resume words:', resumeWords);

const relevantTags = new Set();
for (const word of resumeWords) {
  if (skillTagMap[word]) {
    skillTagMap[word].forEach(t => relevantTags.add(t));
  }
}
console.log('Relevant tags:', relevantTags);
async function checkRealTags() {
  const response = await fetch('https://remoteok.com/api');
  const data = await response.json();
  const jobs = data.slice(1);

  const allTags = new Set();
  jobs.forEach(job => {
    if (job.tags) job.tags.forEach(t => allTags.add(t.toLowerCase()));
  });

  console.log('All unique tags in current RemoteOK batch:', allTags);
}

checkRealTags();
