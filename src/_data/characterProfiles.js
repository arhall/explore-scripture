// Enhanced character profiles with biographical and thematic information
// Based on the principle that "the sacred record, like a faithful mirror has no flattery in its portrait"

module.exports = function() {
  return {
    // Major Biblical Figures with detailed profiles
    
    // PATRIARCHS & MATRIARCHS
    "Abraham": {
      name: "Abraham",
      testament: "Old",
      category: "Patriarch",
      thematicRole: "For explorers and pioneers of faith",
      elementsOfPower: [
        "Unwavering faith in God's promises",
        "Willingness to leave the familiar",
        "Hospitality and generosity",
        "Intercession for others"
      ],
      weaknessesAndFailures: [
        "Deception about Sarah being his sister",
        "Impatience leading to Ishmael's birth",
        "Lack of faith in Egypt and Gerar"
      ],
      victoriesOverDifficulties: [
        "Left his homeland at God's call",
        "Trusted God despite childlessness",
        "Willing to sacrifice Isaac",
        "Rescued Lot from captivity"
      ],
      relationshipToGod: "Friend of God, father of faith",
      keyVerses: ["Genesis 12:1-3", "Romans 4:16-17", "James 2:23"],
      lifeEvents: {
        birth: "Ur of the Chaldees",
        death: "Age 175, buried in Machpelah",
        keyMoment: "Covenant with God (Genesis 15)"
      },
      characterType: "Faithful pioneer",
      modernApplication: "Model for stepping out in faith and trusting God's timing"
    },

    "Moses": {
      name: "Moses",
      testament: "Old", 
      category: "Prophet/Leader",
      thematicRole: "For patriots and national leaders",
      elementsOfPower: [
        "Direct communion with God",
        "Miraculous signs and wonders",
        "Unwavering commitment to his people",
        "Humility despite great authority"
      ],
      weaknessesAndFailures: [
        "Murder of Egyptian in anger",
        "Reluctance to accept God's call",
        "Striking the rock in anger",
        "Not entering the Promised Land"
      ],
      victoriesOverDifficulties: [
        "Overcame speech impediment through God",
        "Faced down Pharaoh repeatedly",
        "Led rebellious people for 40 years",
        "Received and preserved God's Law"
      ],
      relationshipToGod: "Face-to-face communion, God's chosen deliverer",
      keyVerses: ["Exodus 3:14", "Deuteronomy 34:10", "Hebrews 11:24-26"],
      lifeEvents: {
        birth: "Egypt, during Hebrew slavery",
        death: "Age 120, Mount Nebo",
        keyMoment: "Burning Bush encounter (Exodus 3)"
      },
      characterType: "Reluctant hero",
      modernApplication: "God uses imperfect people for great purposes"
    },

    "David": {
      name: "David", 
      testament: "Old",
      category: "King/Warrior/Psalmist",
      thematicRole: "For leaders who face moral failures",
      elementsOfPower: [
        "Heart after God despite failures",
        "Courage in facing giants",
        "Military and political genius",
        "Poetic and musical gifts"
      ],
      weaknessesAndFailures: [
        "Adultery with Bathsheba",
        "Murder of Uriah",
        "Pride in numbering Israel",
        "Failure to discipline his children"
      ],
      victoriesOverDifficulties: [
        "Defeated Goliath as a youth",
        "Survived Saul's persecution",
        "United and expanded Israel",
        "Genuine repentance after sin"
      ],
      relationshipToGod: "Man after God's own heart, recipient of messianic covenant",
      keyVerses: ["1 Samuel 13:14", "Psalm 51:10", "Acts 13:22"],
      lifeEvents: {
        birth: "Bethlehem, youngest of eight sons",
        death: "Age 70, Jerusalem",
        keyMoment: "Anointing by Samuel (1 Samuel 16)"
      },
      characterType: "Flawed hero",
      modernApplication: "Genuine repentance can restore relationship with God"
    },

    // NEW TESTAMENT FIGURES
    "Peter": {
      name: "Peter (Simon)",
      testament: "New",
      category: "Apostle",
      thematicRole: "For the impulsive who need transformation",
      elementsOfPower: [
        "Bold proclamation of the Gospel",
        "Leadership among the apostles", 
        "Miraculous healing ministry",
        "Pastoral heart for God's people"
      ],
      weaknessesAndFailures: [
        "Impulsive speaking without thinking",
        "Denial of Jesus three times",
        "Hypocrisy regarding Gentile believers",
        "Presumptuous self-confidence"
      ],
      victoriesOverDifficulties: [
        "Became the rock Christ predicted",
        "Preached boldly after Pentecost",
        "Opened the door to Gentile ministry",
        "Martyred faithfully for his faith"
      ],
      relationshipToGod: "Transformed disciple, shepherd of the flock",
      keyVerses: ["Matthew 16:18", "Luke 22:31-32", "John 21:15-17"],
      lifeEvents: {
        birth: "Bethsaida, fisherman",
        death: "Martyred in Rome (crucified upside down)",
        keyMoment: "Confession of Christ as Son of God (Matthew 16)"
      },
      characterType: "Transformed failure",
      modernApplication: "God's grace transforms our greatest weaknesses into strengths"
    },

    // ADDITIONAL BIBLICAL FIGURES - Inspired by StudyandObey.com character studies
    "Samuel": {
      name: "Samuel",
      testament: "Old",
      category: "Prophet/Judge",
      thematicRole: "For those called to spiritual leadership and discernment",
      elementsOfPower: [
        "Direct communication with God from childhood",
        "Spiritual discernment in leadership",
        "Faithful service despite personal disappointment",
        "Courage to speak truth to power"
      ],
      weaknessesAndFailures: [
        "Disappointment with Israel's demand for a king",
        "Difficulty releasing control to new leadership",
        "Family struggles (corrupt sons)",
        "Initial resistance to God's choice of David"
      ],
      victoriesOverDifficulties: [
        "Responded to God's call as a child",
        "Led Israel's transition from judges to monarchy",
        "Anointed both Saul and David as kings",
        "Maintained integrity throughout life"
      ],
      relationshipToGod: "Called from childhood, faithful prophet and intercessor",
      keyVerses: ["1 Samuel 3:10", "1 Samuel 7:12", "1 Samuel 15:22"],
      lifeEvents: {
        birth: "Born to Hannah after prayer for a child",
        death: "Mourned by all Israel",
        keyMoment: "God's first call in the temple (1 Samuel 3)"
      },
      characterType: "Faithful transition leader",
      modernApplication: "God calls us to faithful service even in times of change",
      studySource: "Based on character study principles from StudyandObey.com"
    },

    "Lot": {
      name: "Lot",
      testament: "Old", 
      category: "Relative of Abraham",
      thematicRole: "Warning for those who compromise with worldly values",
      elementsOfPower: [
        "Blessed through association with Abraham",
        "Showed hospitality to angels",
        "Was rescued by God's mercy",
        "Called righteous despite his failures"
      ],
      weaknessesAndFailures: [
        "Chose the best land for selfish reasons",
        "Gradually moved closer to Sodom",
        "Compromised moral standards in Sodom",
        "Offered daughters to protect guests"
      ],
      victoriesOverDifficulties: [
        "Was rescued from Sodom's destruction", 
        "Maintained some moral sense in corrupt environment",
        "Recognized divine messengers",
        "Escaped God's judgment through mercy"
      ],
      relationshipToGod: "Righteous but compromised believer",
      keyVerses: ["Genesis 19:16", "2 Peter 2:7-8", "Genesis 13:10-11"],
      lifeEvents: {
        birth: "Nephew of Abraham",
        death: "In a cave with his daughters",
        keyMoment: "Choosing the Jordan plain (Genesis 13)"
      },
      characterType: "Compromised believer",
      modernApplication: "Gradual compromise leads to spiritual disaster",
      studySource: "Based on character study principles from StudyandObey.com"
    },

    "Sarah": {
      name: "Sarah",
      testament: "Old",
      category: "Matriarch", 
      thematicRole: "For those learning to trust God's timing",
      elementsOfPower: [
        "Faith in God's impossible promise",
        "Beauty and dignity throughout life",
        "Protective of God's covenant line",
        "Model of submission and respect"
      ],
      weaknessesAndFailures: [
        "Laughter at God's promise of a child",
        "Jealousy and harsh treatment of Hagar",
        "Trying to help God fulfill His promise",
        "Fear leading to deception about marriage"
      ],
      victoriesOverDifficulties: [
        "Conceived Isaac at age 90",
        "Trusted Abraham in difficult situations", 
        "Maintained faith through decades of waiting",
        "Protected the covenant promise"
      ],
      relationshipToGod: "Partner in the covenant promise, mother of nations",
      keyVerses: ["Genesis 18:14", "Romans 4:19", "Hebrews 11:11", "1 Peter 3:6"],
      lifeEvents: {
        birth: "Born in Ur, traveled to Canaan",
        death: "Age 127, first burial in Promised Land",
        keyMoment: "Birth of Isaac (Genesis 21)"
      },
      characterType: "Patient believer",
      modernApplication: "God's timing is perfect even when it seems impossible",
      studySource: "Based on character study principles from StudyandObey.com"
    },

    "Isaac": {
      name: "Isaac",
      testament: "Old",
      category: "Patriarch",
      thematicRole: "For those who are bridges between generations",
      elementsOfPower: [
        "Peaceful nature and conflict avoidance",
        "Faithfulness to God's covenant",
        "Prosperity through God's blessing",
        "Submission to his father's leadership"
      ],
      weaknessesAndFailures: [
        "Passive personality in family conflicts",
        "Deception about Rebekah being his sister",
        "Favoritism toward Esau",
        "Spiritual blindness regarding God's choice"
      ],
      victoriesOverDifficulties: [
        "Submitted to sacrifice on Mount Moriah",
        "Trusted God during famine",
        "Made peace with hostile neighbors",
        "Blessed his sons according to God's will"
      ],
      relationshipToGod: "Covenant heir, child of promise",
      keyVerses: ["Genesis 22:2", "Genesis 26:24", "Galatians 4:28"],
      lifeEvents: {
        birth: "Miracle child to 100-year-old Abraham",
        death: "Age 180, blessed his sons",
        keyMoment: "Near sacrifice by Abraham (Genesis 22)"
      },
      characterType: "Peaceful mediator",
      modernApplication: "God uses quiet faithfulness as much as bold action",
      studySource: "Based on character study principles from StudyandObey.com"
    },

    "Jacob": {
      name: "Jacob",
      testament: "Old",
      category: "Patriarch",
      thematicRole: "For those who struggle with God and are transformed",
      elementsOfPower: [
        "Tenacity in pursuing God's blessing",
        "Strategic thinking and planning",
        "Deep love for his family",
        "Eventual spiritual maturity"
      ],
      weaknessesAndFailures: [
        "Deception of his father Isaac",
        "Exploitation of Esau's desperation", 
        "Favoritism among his children",
        "Fear and anxiety in crises"
      ],
      victoriesOverDifficulties: [
        "Wrestling with God and receiving new name",
        "Reconciliation with his brother Esau",
        "Prosperity despite Laban's deception",
        "Blessed all twelve sons prophetically"
      ],
      relationshipToGod: "Wrestled with God and prevailed, father of the twelve tribes",
      keyVerses: ["Genesis 32:28", "Genesis 28:15", "Hebrews 11:21"],
      lifeEvents: {
        birth: "Twin to Esau, younger son",
        death: "Age 147 in Egypt",
        keyMoment: "Wrestling with God at Peniel (Genesis 32)"
      },
      characterType: "Transformed wrestler",
      modernApplication: "God transforms our character through divine encounters",
      studySource: "Based on character study principles from StudyandObey.com"
    },

    "Joseph": {
      name: "Joseph",
      testament: "Old",
      category: "Patriarch/Leader", 
      thematicRole: "For those who suffer injustice but trust God's sovereignty",
      elementsOfPower: [
        "Integrity in the face of temptation",
        "Administrative and leadership gifts",
        "Ability to interpret dreams and see God's plan",
        "Forgiveness toward those who wronged him"
      ],
      weaknessesAndFailures: [
        "Youthful pride and tactless sharing of dreams",
        "Possible favoritism from his father",
        "Brief moments of despair in prison",
        "Testing his brothers harshly"
      ],
      victoriesOverDifficulties: [
        "Remained faithful during slavery",
        "Resisted Potiphar's wife's advances",
        "Maintained hope during imprisonment",
        "Saved Egypt and his family from famine"
      ],
      relationshipToGod: "Trusted God's sovereignty through all circumstances",
      keyVerses: ["Genesis 50:20", "Genesis 39:9", "Psalm 105:17-22"],
      lifeEvents: {
        birth: "Beloved son of Jacob and Rachel",
        death: "Age 110 in Egypt",
        keyMoment: "Revelation to his brothers (Genesis 45)"
      },
      characterType: "Sovereign servant",
      modernApplication: "God works all things together for good for those who love Him",
      studySource: "Based on character study principles from StudyandObey.com"
    },

    "Ruth": {
      name: "Ruth",
      testament: "Old",
      category: "Foreign Convert",
      thematicRole: "For those who show loyalty and find redemption",
      elementsOfPower: [
        "Extraordinary loyalty and devotion",
        "Willingness to embrace the true God", 
        "Humble and hardworking character",
        "Trust in God's provision"
      ],
      weaknessesAndFailures: [
        "Limited resources as a widow",
        "Foreign background in a xenophobic culture",
        "Vulnerable position as a single woman",
        "Risk in approaching Boaz"
      ],
      victoriesOverDifficulties: [
        "Chose God and Israel over her homeland",
        "Provided for Naomi through gleaning",
        "Found favor with Boaz",
        "Became ancestor of David and Christ"
      ],
      relationshipToGod: "Faithful convert who found grace and redemption",
      keyVerses: ["Ruth 1:16", "Ruth 2:12", "Matthew 1:5"],
      lifeEvents: {
        birth: "Moabite woman",
        death: "Unknown, but lived to see great-grandchildren",
        keyMoment: "Declaration of loyalty to Naomi (Ruth 1)"
      },
      characterType: "Loyal redeemed",
      modernApplication: "God rewards faithfulness and includes outsiders in His plan",
      studySource: "Based on character study principles from StudyandObey.com"
    },

    "Paul": {
      name: "Paul (Saul)",
      testament: "New",
      category: "Apostle/Missionary",
      thematicRole: "For the zealous who need redirection",
      elementsOfPower: [
        "Brilliant theological mind",
        "Tireless missionary zeal",
        "Ability to suffer for the Gospel",
        "Church planting and leadership"
      ],
      weaknessesAndFailures: [
        "Persecution of early Christians",
        "Pride in his religious achievements",
        "Sharp disagreement with Barnabas",
        "Possible pride in his revelations"
      ],
      victoriesOverDifficulties: [
        "Complete transformation on Damascus road",
        "Acceptance by suspicious early church",
        "Endured beatings, shipwrecks, imprisonment",
        "Planted churches across Roman Empire"
      ],
      relationshipToGod: "Chosen vessel for the Gentiles, apostle by grace",
      keyVerses: ["Acts 9:15", "1 Corinthians 15:9-10", "Philippians 3:7-8"],
      lifeEvents: {
        birth: "Tarsus, Roman citizen and Pharisee",
        death: "Martyred in Rome under Nero",
        keyMoment: "Damascus Road conversion (Acts 9)"
      },
      characterType: "Redeemed persecutor", 
      modernApplication: "No one is beyond God's transforming grace"
    },

    // CHARACTERS OF WARNING
    "Judas Iscariot": {
      name: "Judas Iscariot",
      testament: "New",
      category: "Disciple/Betrayer",
      thematicRole: "Warning against greed and betrayal",
      elementsOfPower: [
        "Chosen as one of the Twelve",
        "Trusted with the money box",
        "Witnessed Christ's miracles firsthand",
        "Had opportunity for greatness"
      ],
      weaknessesAndFailures: [
        "Love of money over loyalty",
        "Betrayal of innocent blood",
        "Theft from the common purse", 
        "Despair leading to suicide"
      ],
      privilegesAbused: [
        "Direct discipleship under Jesus",
        "Authority to cast out demons",
        "Participation in feeding miracles",
        "Three years of intimate teaching"
      ],
      relationshipToGod: "Lost son of perdition, rejected grace",
      keyVerses: ["John 17:12", "Matthew 26:24", "Acts 1:16-20"],
      lifeEvents: {
        birth: "Possibly Kerioth in Judah",
        death: "Suicide by hanging",
        keyMoment: "Betrayal in Gethsemane (Matthew 26:47-50)"
      },
      characterType: "Tragic warning",
      modernApplication: "Proximity to Jesus doesn't guarantee salvation; the heart must be surrendered"
    },

    "Samson": {
      name: "Samson",
      testament: "Old",
      category: "Judge",
      thematicRole: "Warning against moral compromise",
      elementsOfPower: [
        "Supernatural physical strength",
        "Called as deliverer from birth",
        "Miraculous victories over Philistines",
        "Twenty years as judge"
      ],
      weaknessesAndFailures: [
        "Lust and immoral relationships",
        "Violation of Nazirite vows",
        "Reckless disregard for his calling",
        "Pride in his own strength"
      ],
      victoriesOverDifficulties: [
        "Killed a lion with bare hands",
        "Defeated 1,000 Philistines with jawbone",
        "Broke free from bonds repeatedly",
        "Final victory in death over enemies"
      ],
      relationshipToGod: "Set apart as Nazirite, restored at death",
      keyVerses: ["Judges 13:5", "Judges 16:28-30", "Hebrews 11:32"],
      lifeEvents: {
        birth: "Zorah, to previously barren mother",
        death: "Gaza, bringing down Philistine temple",
        keyMoment: "Loss and restoration of strength (Judges 16)"
      },
      characterType: "Gifted but undisciplined",
      modernApplication: "Great gifts require great responsibility and self-discipline"
    },

    // CHARACTERS OF ENCOURAGEMENT
    "Joseph": {
      name: "Joseph",
      testament: "Old", 
      category: "Dreamer/Ruler",
      thematicRole: "For men of distinction facing trials",
      elementsOfPower: [
        "Integrity in every circumstance",
        "Gift of dream interpretation",
        "Administrative excellence",
        "Forgiveness toward those who wronged him"
      ],
      weaknessesAndFailures: [
        "Youthful boasting about dreams",
        "Possible pride in father's favor",
        "Initial harshness toward brothers in Egypt"
      ],
      victoriesOverDifficulties: [
        "Maintained purity in Potiphar's house",
        "Rose from prison to second in Egypt",
        "Preserved Egypt and his family from famine",
        "Chose forgiveness over revenge"
      ],
      relationshipToGod: "Recognized God's providence in all circumstances",
      keyVerses: ["Genesis 50:20", "Psalm 105:17-22", "Acts 7:9-10"],
      lifeEvents: {
        birth: "Canaan, son of Jacob and Rachel",
        death: "Age 110 in Egypt",
        keyMoment: "Sold into slavery by brothers (Genesis 37)"
      },
      characterType: "Faithful through trials",
      modernApplication: "God works all things together for good for those who love Him"
    },

    "Daniel": {
      name: "Daniel",
      testament: "Old",
      category: "Prophet/Statesman", 
      thematicRole: "For the forlorn in hostile cultures",
      elementsOfPower: [
        "Unwavering commitment to God's law",
        "Wisdom exceeding all counselors", 
        "Prophetic insight into future",
        "Integrity in government service"
      ],
      weaknessesAndFailures: [
        "Deep grief over Israel's condition",
        "Overwhelming visions causing weakness"
      ],
      victoriesOverDifficulties: [
        "Maintained faith in pagan culture",
        "Interpreted dreams and visions",
        "Survived lion's den unharmed",
        "Served faithfully under multiple kings"
      ],
      relationshipToGod: "Greatly beloved of God, faithful prophet",
      keyVerses: ["Daniel 1:8", "Daniel 6:23", "Daniel 10:11"],
      lifeEvents: {
        birth: "Jerusalem, of noble or royal family",
        death: "Babylon, in old age",
        keyMoment: "Resolution not to defile himself (Daniel 1:8)"
      },
      characterType: "Uncompromising saint",
      modernApplication: "Faithfulness to God brings His protection and blessing"
    },

    "Ezra": {
      name: "Ezra",
      testament: "Old",
      category: "Priest/Scribe/Reformer",
      thematicRole: "For those who lead spiritual renewal through God's Word",
      elementsOfPower: [
        "Deep knowledge of Scripture",
        "Commitment to teaching and applying God's law",
        "Leadership in spiritual reformation",
        "Courage to confront sin"
      ],
      weaknessesAndFailures: [
        "Possibly overly harsh in family matters",
        "Cultural rigidity at times",
        "Dependence on royal patronage",
        "Limited understanding of grace"
      ],
      victoriesOverDifficulties: [
        "Led return from Babylonian exile",
        "Restored proper worship in Jerusalem",
        "Reformed mixed marriages issue",
        "Established Scripture reading tradition"
      ],
      relationshipToGod: "Devoted student and teacher of God's Word",
      keyVerses: ["Ezra 7:10", "Ezra 7:6", "Nehemiah 8:1-8"],
      lifeEvents: {
        birth: "Babylon, during exile",
        death: "Unknown, but lived to see temple restoration",
        keyMoment: "Reading the Law to the people (Nehemiah 8)"
      },
      characterType: "Scripture-centered reformer",
      modernApplication: "God uses those devoted to His Word to lead spiritual renewal",
      studySource: "Based on character study principles from StudyandObey.com"
    },

    "Nehemiah": {
      name: "Nehemiah", 
      testament: "Old",
      category: "Governor/Reformer",
      thematicRole: "For those who build and restore what has been broken",
      elementsOfPower: [
        "Administrative and organizational skills",
        "Dependence on prayer in all situations",
        "Courage to face opposition",
        "Commitment to completing God's work"
      ],
      weaknessesAndFailures: [
        "Occasional harshness with opponents",
        "Cultural exclusivism",
        "Pride in his accomplishments",
        "Impatience with slow progress"
      ],
      victoriesOverDifficulties: [
        "Rebuilt Jerusalem's walls in 52 days",
        "Overcame external and internal opposition",
        "Implemented economic and social reforms",
        "Established security for the returned exiles"
      ],
      relationshipToGod: "Prayerful leader who sought God's guidance constantly",
      keyVerses: ["Nehemiah 1:4", "Nehemiah 6:3", "Nehemiah 4:9"],
      lifeEvents: {
        birth: "Born in exile, served in Persian court",
        death: "Returned to Persia, later came back to Jerusalem",
        keyMoment: "Hearing about Jerusalem's broken walls (Nehemiah 1)"
      },
      characterType: "Prayerful builder",
      modernApplication: "God accomplishes great things through those who combine prayer with action",
      studySource: "Based on character study principles from StudyandObey.com"
    },

    "Daniel": {
      name: "Daniel",
      testament: "Old",
      category: "Prophet/Government Official",
      thematicRole: "For those who maintain faith in hostile environments",
      elementsOfPower: [
        "Unwavering commitment to God's law",
        "Supernatural gift of dream interpretation",
        "Integrity in government service",
        "Prophetic insight into future events"
      ],
      weaknessesAndFailures: [
        "Possible pride in his own righteousness",
        "Limited recorded failures or struggles",
        "Cultural adaptation while maintaining faith",
        "Grief over his people's continued rebellion"
      ],
      victoriesOverDifficulties: [
        "Maintained Jewish dietary laws in Babylon",
        "Survived the lion's den",
        "Served faithfully under multiple kings",
        "Received and recorded prophetic visions"
      ],
      relationshipToGod: "Greatly beloved, faithful prophet in exile",
      keyVerses: ["Daniel 1:8", "Daniel 6:10", "Daniel 9:23"],
      lifeEvents: {
        birth: "Jerusalem nobility, taken to Babylon as youth",
        death: "Old age in Babylon",
        keyMoment: "Refusing the king's food (Daniel 1)"
      },
      characterType: "Faithful exile",
      modernApplication: "Maintaining faithfulness to God in ungodly environments is possible and powerful",
      studySource: "Based on character study principles from StudyandObey.com"
    },

    "Elijah": {
      name: "Elijah",
      testament: "Old",
      category: "Prophet",
      thematicRole: "For those who stand alone against corruption and compromise",
      elementsOfPower: [
        "Miraculous power over nature",
        "Courage to confront wicked rulers",
        "Direct communion with God",
        "Zeal for God's honor and law"
      ],
      weaknessesAndFailures: [
        "Despair and discouragement after victories",
        "Feeling alone in his calling",
        "Harsh judgment on those who opposed God",
        "Fear of Jezebel's threats"
      ],
      victoriesOverDifficulties: [
        "Confronted 450 prophets of Baal on Mount Carmel",
        "Raised the widow's son from the dead",
        "Survived the drought he predicted",
        "Taken up to heaven without dying"
      ],
      relationshipToGod: "Fiery prophet, precursor to John the Baptist",
      keyVerses: ["1 Kings 18:21", "1 Kings 19:12", "Malachi 4:5"],
      lifeEvents: {
        birth: "Tishbe in Gilead",
        death: "Taken up in a whirlwind",
        keyMoment: "Mount Carmel contest (1 Kings 18)"
      },
      characterType: "Fiery reformer",
      modernApplication: "God provides strength for those who stand courageously for truth",
      studySource: "Based on character study principles from StudyandObey.com"
    },

    // Add character categories for organization
    characterCategories: {
      "Faithful Pioneers": ["Abraham", "Caleb", "Joshua"],
      "Flawed Heroes": ["David", "Gideon", "Samson"],
      "Transformed Failures": ["Peter", "Paul", "John Mark"],
      "Uncompromising Saints": ["Daniel", "Shadrach", "Meshach", "Abednego"],
      "Loyal Friends": ["Jonathan", "Ruth", "Ittai"],
      "Tragic Warnings": ["Judas Iscariot", "Saul", "Solomon"],
      "Faithful Servants": ["Joseph", "Samuel", "Timothy"],
      "Courageous Women": ["Esther", "Deborah", "Mary Magdalene"],
      "Wise Counselors": ["Nathan", "Gamaliel", "Barnabas"],
      "Patient Sufferers": ["Job", "Jeremiah", "Stephen"]
    },

    // Thematic roles as described in the source text
    thematicRoles: {
      "For explorers": "Abraham",
      "For merchant princes": "Job", 
      "For patriots": "Moses",
      "For rulers": "Samuel",
      "For reformers": "Elijah",
      "For men of distinction": "Joseph",
      "For the forlorn": "Daniel", 
      "For the persecuted": "Jeremiah",
      "For the soldier": "Caleb",
      "For the farmer": "Boaz",
      "For the lay-preacher": "Amos"
    }
  };
};