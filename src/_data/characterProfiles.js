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