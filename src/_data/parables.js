const RAW_PARABLES = [
  {
    id: 'P001',
    title: 'Wise & Foolish Builders',
    refs: ['Matthew 7:24-27', 'Luke 6:47-49'],
    gospels: ['Matthew', 'Luke'],
    summary:
      'One man builds a house on rock and it stands through storm and flood; another builds on sand/without a foundation and the house collapses when the storm hits.',
  },
  {
    id: 'P002',
    title: 'Children in the Marketplace',
    refs: ['Matthew 11:16-19', 'Luke 7:31-35'],
    gospels: ['Matthew', 'Luke'],
    summary:
      'Children complain that others will not join their games: they played music but no one danced, and they sang a funeral song but no one mourned.',
  },
  {
    id: 'P003',
    title: 'New Patch on an Old Garment',
    refs: ['Matthew 9:16', 'Mark 2:21', 'Luke 5:36'],
    gospels: ['Matthew', 'Mark', 'Luke'],
    summary:
      'A new cloth patch sewn onto an old garment pulls away and tears the old fabric, making the rip worse.',
  },
  {
    id: 'P004',
    title: 'New Wine in Old Wineskins',
    refs: ['Matthew 9:17', 'Mark 2:22', 'Luke 5:37-39'],
    gospels: ['Matthew', 'Mark', 'Luke'],
    summary:
      'New wine poured into old wineskins expands and bursts them, spilling the wine; new wine belongs in fresh skins (Luke adds that someone used to old wine says the old is good).',
  },
  {
    id: 'P005',
    title: 'The Sower (Four Soils)',
    refs: ['Matthew 13:1-23', 'Mark 4:1-20', 'Luke 8:4-15'],
    gospels: ['Matthew', 'Mark', 'Luke'],
    summary:
      'A farmer scatters seed: some falls on the path and is eaten by birds, some on rocky ground sprouts quickly then withers, some among thorns is choked, and some on good soil produces a harvest.',
  },
  {
    id: 'P006',
    title: 'The Weeds Among the Wheat',
    refs: ['Matthew 13:24-30', 'Matthew 13:36-43'],
    gospels: ['Matthew'],
    summary:
      'An enemy sows weeds among a man\'s wheat; servants want to pull them up, but the owner says to wait until harvest, when wheat and weeds will be gathered and separated.',
  },
  {
    id: 'P007',
    title: 'The Mustard Seed',
    refs: ['Matthew 13:31-32', 'Mark 4:30-32', 'Luke 13:18-19'],
    gospels: ['Matthew', 'Mark', 'Luke'],
    summary:
      'A tiny mustard seed is planted and grows into a large plant with branches where birds can perch or nest.',
  },
  {
    id: 'P008',
    title: 'The Leaven',
    refs: ['Matthew 13:33', 'Luke 13:20-21'],
    gospels: ['Matthew', 'Luke'],
    summary:
      'A woman mixes a small amount of leaven into a large batch of flour until it spreads through the whole dough.',
  },
  {
    id: 'P009',
    title: 'Hidden Treasure',
    refs: ['Matthew 13:44'],
    gospels: ['Matthew'],
    summary:
      'A man finds treasure hidden in a field, hides it again, then sells what he has to buy the field.',
  },
  {
    id: 'P010',
    title: 'Pearl of Great Price',
    refs: ['Matthew 13:45-46'],
    gospels: ['Matthew'],
    summary:
      'A merchant searching for pearls finds one extremely valuable pearl and sells everything to buy it.',
  },
  {
    id: 'P011',
    title: 'The Dragnet',
    refs: ['Matthew 13:47-50'],
    gospels: ['Matthew'],
    summary:
      'Fishermen cast a large net that gathers all kinds of fish; when it is full, they sit down and sort the good into containers and throw away the bad.',
  },
  {
    id: 'P012',
    title: 'Householder with New and Old Treasures',
    refs: ['Matthew 13:52'],
    gospels: ['Matthew'],
    summary:
      'A householder brings out of his storeroom both older items and newer ones.',
  },
  {
    id: 'P013',
    title: 'Lamp on a Stand (Lamp Under a Basket)',
    refs: ['Matthew 5:14-16', 'Mark 4:21-25', 'Luke 8:16-18'],
    gospels: ['Matthew', 'Mark', 'Luke'],
    summary:
      'A lamp is lit and placed on a stand so it gives light; it is not put under a basket/container or under a bed where it is hidden.',
  },
  {
    id: 'P014',
    title: 'The Measure You Use',
    refs: ['Mark 4:24-25', 'Luke 8:18'],
    gospels: ['Mark', 'Luke'],
    summary:
      'A measuring cup is used: the amount measured out is matched (or exceeded) in return, and those who have gain more while those who do not lose even what they seem to have.',
  },
  {
    id: 'P015',
    title: 'Growing Seed (Seed Growing Secretly)',
    refs: ['Mark 4:26-29'],
    gospels: ['Mark'],
    summary:
      'A man scatters seed and, while he sleeps and wakes, it sprouts and grows - first blade, then ear, then full grain - until it is ripe and he harvests.',
  },
  {
    id: 'P016',
    title: 'The Lost Sheep',
    refs: ['Matthew 18:12-14', 'Luke 15:3-7'],
    gospels: ['Matthew', 'Luke'],
    summary:
      'A shepherd with a hundred sheep loses one, leaves the ninety-nine, searches until he finds it, and returns rejoicing.',
  },
  {
    id: 'P017',
    title: 'The Lost Coin',
    refs: ['Luke 15:8-10'],
    gospels: ['Luke'],
    summary:
      'A woman loses one of ten coins, lights a lamp, sweeps the house, searches carefully until she finds it, then calls others to rejoice.',
  },
  {
    id: 'P018',
    title: 'The Prodigal Son (Lost Son)',
    refs: ['Luke 15:11-32'],
    gospels: ['Luke'],
    summary:
      'A younger son takes his inheritance early, leaves, squanders it, and ends up starving; he returns, and his father runs to welcome and restore him with a feast while the older brother refuses to celebrate.',
  },
  {
    id: 'P019',
    title: 'The Unforgiving Servant',
    refs: ['Matthew 18:21-35'],
    gospels: ['Matthew'],
    summary:
      'A king forgives a servant\'s enormous debt; that servant then refuses to forgive a fellow servant\'s small debt, leading the king to punish the first servant.',
  },
  {
    id: 'P020',
    title: 'Workers in the Vineyard',
    refs: ['Matthew 20:1-16'],
    gospels: ['Matthew'],
    summary:
      'A landowner hires workers at different hours of the day but pays them all the same wage at day\'s end, and the early workers complain.',
  },
  {
    id: 'P021',
    title: 'The Two Sons',
    refs: ['Matthew 21:28-32'],
    gospels: ['Matthew'],
    summary:
      'A father asks two sons to work: one says no but later goes, the other says yes but does not go.',
  },
  {
    id: 'P022',
    title: 'The Wicked Tenants',
    refs: ['Matthew 21:33-46', 'Mark 12:1-12', 'Luke 20:9-19'],
    gospels: ['Matthew', 'Mark', 'Luke'],
    summary:
      'Tenants beat and kill the owner\'s servants sent for fruit; they then kill the owner\'s son to seize the inheritance, and the owner comes, destroys the tenants, and gives the vineyard to others.',
  },
  {
    id: 'P023',
    title: 'The Wedding Banquet (with Wedding Garment)',
    refs: ['Matthew 22:1-14'],
    gospels: ['Matthew'],
    summary:
      'A king prepares a wedding feast and invites guests who refuse and even mistreat messengers; he fills the hall with others, but one guest without wedding clothes is expelled.',
  },
  {
    id: 'P024',
    title: 'The Great Banquet',
    refs: ['Luke 14:15-24'],
    gospels: ['Luke'],
    summary:
      'Invited guests make excuses and decline; the host brings in the poor and outcasts, then sends for more from roads and hedges until the house is filled.',
  },
  {
    id: 'P025',
    title: 'Taking the Lowest Seat',
    refs: ['Luke 14:7-11'],
    gospels: ['Luke'],
    summary:
      'At a banquet, someone takes an honored seat and is told to move down; another takes a low seat and is invited to move up.',
  },
  {
    id: 'P026',
    title: 'Tower Builder (Counting the Cost)',
    refs: ['Luke 14:28-30'],
    gospels: ['Luke'],
    summary:
      'Someone starts building a tower without calculating costs, lays a foundation, cannot finish, and becomes an object of ridicule.',
  },
  {
    id: 'P027',
    title: 'King Going to War',
    refs: ['Luke 14:31-33'],
    gospels: ['Luke'],
    summary:
      'A king considers going to war while outnumbered, evaluates whether he can win, and if not, sends to seek terms of peace.',
  },
  {
    id: 'P028',
    title: 'Friend at Midnight',
    refs: ['Luke 11:5-8'],
    gospels: ['Luke'],
    summary:
      'A man wakes his friend at midnight asking for bread for a guest; the friend initially refuses but eventually gets up and gives what is needed.',
  },
  {
    id: 'P029',
    title: 'The Strong Man (Plundering the House)',
    refs: ['Matthew 12:29', 'Mark 3:27', 'Luke 11:21-22'],
    gospels: ['Matthew', 'Mark', 'Luke'],
    summary:
      'A strong man guards his house, but a stronger one overpowers him, binds/defeats him, and takes his goods.',
  },
  {
    id: 'P030',
    title: 'The Rich Fool (Bigger Barns)',
    refs: ['Luke 12:16-21'],
    gospels: ['Luke'],
    summary:
      'A rich man\'s land yields abundantly; he tears down barns to build bigger ones and plans to relax, but that night he dies and his stored goods are left behind.',
  },
  {
    id: 'P031',
    title: 'Watchful Servants (Waiting for the Master)',
    refs: ['Luke 12:35-38'],
    gospels: ['Luke'],
    summary:
      'Servants stay dressed and ready with lamps lit, waiting to open immediately when the master returns and knocks.',
  },
  {
    id: 'P032',
    title: 'Thief in the Night (Burglar and Homeowner)',
    refs: ['Matthew 24:43-44', 'Luke 12:39-40'],
    gospels: ['Matthew', 'Luke'],
    summary:
      'If the homeowner knew when a thief was coming, he would stay awake and not let the house be broken into.',
  },
  {
    id: 'P033',
    title: 'Faithful vs. Wicked Servant / Steward',
    refs: ['Matthew 24:45-51', 'Mark 13:34-37', 'Luke 12:42-48'],
    gospels: ['Matthew', 'Mark', 'Luke'],
    summary:
      'A master leaves a servant in charge; one carries out responsibilities, another abuses others and behaves badly, and the master returns unexpectedly to deal with each.',
  },
  {
    id: 'P034',
    title: 'The Barren Fig Tree',
    refs: ['Luke 13:6-9'],
    gospels: ['Luke'],
    summary:
      'A man looks for fruit on a fig tree for years and finds none, orders it cut down, but the gardener asks for one more year to dig around it and fertilize it before deciding.',
  },
  {
    id: 'P035',
    title: 'Fig Tree Lesson (Budding Branch / All Trees)',
    refs: ['Matthew 24:32-35', 'Mark 13:28-31', 'Luke 21:29-33'],
    gospels: ['Matthew', 'Mark', 'Luke'],
    summary:
      'When a fig tree (and other trees) put out leaves, people know summer is near; likewise, observing certain signs indicates nearness.',
  },
  {
    id: 'P036',
    title: 'The Ten Virgins',
    refs: ['Matthew 25:1-13'],
    gospels: ['Matthew'],
    summary:
      'Ten bridesmaids await the bridegroom; five bring extra oil and five do not. The bridegroom arrives at midnight, the prepared enter the feast, and the door is shut before the others return.',
  },
  {
    id: 'P037',
    title: 'The Talents',
    refs: ['Matthew 25:14-30'],
    gospels: ['Matthew'],
    summary:
      'A man going on a journey entrusts differing sums to servants; two trade and gain more, one hides the money. On return, the first two are rewarded and the one who buried it is condemned.',
  },
  {
    id: 'P038',
    title: 'The Minas (Pounds)',
    refs: ['Luke 19:11-27'],
    gospels: ['Luke'],
    summary:
      'A nobleman goes away to receive a kingdom, entrusts money to servants to do business, is rejected by some citizens, then returns as king to reward profitable servants, condemn the one who hid the money, and judge opponents.',
  },
  {
    id: 'P039',
    title: 'The Dishonest (Shrewd) Manager',
    refs: ['Luke 16:1-13'],
    gospels: ['Luke'],
    summary:
      'A manager accused of wasting his master\'s goods is about to be fired, so he quickly reduces debtors\' bills to secure their future favor; the master commends his shrewdness.',
  },
  {
    id: 'P040',
    title: 'The Rich Man and Lazarus',
    refs: ['Luke 16:19-31'],
    gospels: ['Luke'],
    summary:
      'A rich man lives in luxury while poor Lazarus lies at his gate. Both die: Lazarus is comforted and the rich man is in torment, begging for relief and for Lazarus to warn his brothers, but the request is denied.',
  },
  {
    id: 'P041',
    title: 'Unworthy Servants (Servant and Master at Supper)',
    refs: ['Luke 17:7-10'],
    gospels: ['Luke'],
    summary:
      'A servant returns from fieldwork; the master expects the servant to prepare and serve the meal first, and only afterward does the servant eat.',
  },
  {
    id: 'P042',
    title: 'Persistent Widow and the Unjust Judge',
    refs: ['Luke 18:1-8'],
    gospels: ['Luke'],
    summary:
      'A widow repeatedly appeals to an unjust judge for justice; he finally grants her request simply to stop being worn down by her persistence.',
  },
  {
    id: 'P043',
    title: 'Pharisee and Tax Collector',
    refs: ['Luke 18:9-14'],
    gospels: ['Luke'],
    summary:
      'Two men pray: a Pharisee boasts about his righteousness, while a tax collector stands at a distance, beats his chest, and pleads for mercy.',
  },
  {
    id: 'P044',
    title: 'Blind Leading the Blind',
    refs: ['Luke 6:39'],
    gospels: ['Luke'],
    summary:
      'A blind person tries to guide another blind person, and both end up falling into a pit.',
  },
  {
    id: 'P045',
    title: 'Speck and Log',
    refs: ['Matthew 7:3-5', 'Luke 6:41-42'],
    gospels: ['Matthew', 'Luke'],
    summary:
      'Someone tries to remove a tiny speck from another person\'s eye while a large plank remains in his own eye.',
  },
  {
    id: 'P046',
    title: 'Tree and Its Fruit',
    refs: ['Matthew 7:17-20', 'Luke 6:43-45'],
    gospels: ['Matthew', 'Luke'],
    summary:
      'A good tree produces good fruit and a bad tree produces bad fruit; each tree is recognized by what it bears.',
  },
  {
    id: 'P047',
    title: 'Unclean Spirit Returning',
    refs: ['Matthew 12:43-45', 'Luke 11:24-26'],
    gospels: ['Matthew', 'Luke'],
    summary:
      'An unclean spirit leaves a person, wanders, then returns to find the house empty and in order; it brings more spirits, and the person\'s final state becomes worse than before.',
  },
  {
    id: 'P048',
    title: 'Sheep and Goats (Judgment Scene)',
    refs: ['Matthew 25:31-46'],
    gospels: ['Matthew'],
    summary:
      'A king separates people like a shepherd separates sheep from goats, places them on different sides, recounts their deeds, and pronounces different outcomes.',
  },
  {
    id: 'P049',
    title: 'Shepherd and the Door (Sheepfold)',
    refs: ['John 10:1-10'],
    gospels: ['John'],
    summary:
      'A shepherd enters the sheepfold by the door, calls his sheep and leads them out, and they follow; thieves climb in another way to steal and harm.',
  },
  {
    id: 'P050',
    title: 'The Good Shepherd',
    refs: ['John 10:11-18'],
    gospels: ['John'],
    summary:
      'The good shepherd lays down his life for the sheep; a hired hand runs away when danger comes; the shepherd knows his sheep and gathers them.',
  },
  {
    id: 'P051',
    title: 'Vine and Branches',
    refs: ['John 15:1-17'],
    gospels: ['John'],
    summary:
      'A vine has branches; the gardener prunes fruitful branches and removes fruitless ones; connected branches bear fruit while severed ones wither.',
  },
  {
    id: 'P052',
    title: 'Grain of Wheat',
    refs: ['John 12:24'],
    gospels: ['John'],
    summary:
      'A grain of wheat falls into the ground; if it dies it produces many grains, but if it remains alone it stays a single grain.',
  },
];

function normalizeReference(ref) {
  return String(ref).replace(/[\u2013\u2014]/g, '-').replace(/\s+/g, ' ').trim();
}

function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

const parables = RAW_PARABLES.map(parable => {
  const refs = (parable.refs || []).map(normalizeReference);
  const gospels = (parable.gospels || []).map(gospel => String(gospel).trim());

  return {
    ...parable,
    refs,
    gospels,
    anchor: parable.id.toLowerCase(),
    slug: slugify(parable.title),
  };
});

module.exports = parables;
