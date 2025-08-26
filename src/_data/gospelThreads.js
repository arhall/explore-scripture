// Gospel Thread - Tracing Christ and Redemption Throughout Scripture
// Theologically sound from Baptist perspective, accessible to all Protestant denominations

module.exports = function() {
  return {
    // Core Gospel Themes that run through all Scripture
    coreThemes: {
      creation: {
        name: "God's Perfect Creation",
        description: "God's original design and humanity's calling",
        keyVerses: ["Genesis 1:27", "Genesis 2:17", "Psalm 8:4-6"],
        gospelConnection: "Christ as the perfect image of God restores what was lost in the fall"
      },
      fall: {
        name: "The Fall and Need for Redemption", 
        description: "Sin's entrance and its devastating effects",
        keyVerses: ["Genesis 3:15", "Romans 3:23", "Romans 6:23"],
        gospelConnection: "Christ came to defeat Satan and reverse the curse of sin"
      },
      promise: {
        name: "God's Promise of Salvation",
        description: "God's covenant to redeem His people",
        keyVerses: ["Genesis 3:15", "Genesis 12:3", "2 Samuel 7:12-16"],
        gospelConnection: "All promises find their 'Yes' in Christ Jesus"
      },
      sacrifice: {
        name: "Substitutionary Sacrifice",
        description: "The need for a substitute to bear sin's penalty",
        keyVerses: ["Genesis 22:8", "Leviticus 16:15", "Isaiah 53:10"],
        gospelConnection: "Christ is the Lamb of God who takes away the world's sin"
      },
      kingship: {
        name: "God's Kingdom Rule",
        description: "God's plan to rule through His chosen King",
        keyVerses: ["2 Samuel 7:16", "Psalm 2:6-7", "Daniel 7:13-14"],
        gospelConnection: "Jesus is the promised King who establishes God's eternal kingdom"
      },
      newCovenant: {
        name: "New Covenant Fulfillment",
        description: "God's promise of heart transformation",
        keyVerses: ["Jeremiah 31:31-34", "Ezekiel 36:26-27", "2 Corinthians 3:6"],
        gospelConnection: "Christ mediates the new covenant through His blood"
      }
    },

    // Book-by-book Gospel connections
    books: {
      genesis: {
        gospelThemes: ["creation", "fall", "promise"],
        christTypes: [
          {
            passage: "Genesis 3:15",
            type: "Proto-evangelium",
            description: "First promise of a Savior who will defeat Satan",
            fulfillment: "Jesus crushes Satan's head through His death and resurrection"
          },
          {
            passage: "Genesis 22:1-14",
            type: "Abraham's sacrifice of Isaac",
            description: "Father willing to sacrifice his beloved son",
            fulfillment: "God the Father gave His only Son for our sins"
          },
          {
            passage: "Genesis 37-50",
            type: "Joseph's story",
            description: "Rejected by brothers, suffers for others, becomes savior",
            fulfillment: "Jesus was rejected, suffered for sins, became Savior of the world"
          }
        ],
        keyGospelConnections: [
          "The promise of a seed who will defeat evil (3:15)",
          "God's covenant with Abraham blessing all nations (12:3)",
          "The pattern of God's grace through undeserved favor"
        ]
      },
      
      exodus: {
        gospelThemes: ["sacrifice", "promise"],
        christTypes: [
          {
            passage: "Exodus 12:1-30",
            type: "Passover Lamb",
            description: "Innocent lamb's blood saves from death",
            fulfillment: "Christ our Passover Lamb was sacrificed for us (1 Cor 5:7)"
          },
          {
            passage: "Exodus 14:13-31",
            type: "Red Sea deliverance",
            description: "God saves His people through water",
            fulfillment: "Baptism represents our salvation through Christ's death"
          },
          {
            passage: "Exodus 25:8-22",
            type: "Tabernacle and mercy seat",
            description: "God dwelling with His people through blood sacrifice",
            fulfillment: "Jesus tabernacled among us; His blood provides access to God"
          }
        ],
        keyGospelConnections: [
          "Deliverance from bondage pictures salvation from sin",
          "The sacrificial system points to Christ's ultimate sacrifice",
          "God's presence with His people fulfilled in Immanuel"
        ]
      },

      leviticus: {
        gospelThemes: ["sacrifice"],
        christTypes: [
          {
            passage: "Leviticus 16:1-34",
            type: "Day of Atonement",
            description: "Annual covering of sin through blood sacrifice",
            fulfillment: "Jesus made atonement for sin once for all time"
          },
          {
            passage: "Leviticus 17:11",
            type: "Life in the blood",
            description: "Blood required for atonement",
            fulfillment: "Jesus' blood cleanses from all sin"
          }
        ],
        keyGospelConnections: [
          "Holiness required to approach God - Christ makes us holy",
          "Substitutionary sacrifice - Christ died in our place",
          "Priestly mediation - Christ is our great High Priest"
        ]
      },

      psalms: {
        gospelThemes: ["kingship", "sacrifice"],
        christTypes: [
          {
            passage: "Psalm 22",
            type: "Suffering Servant",
            description: "Messianic psalm of crucifixion suffering",
            fulfillment: "Jesus quoted this psalm from the cross"
          },
          {
            passage: "Psalm 110",
            type: "Priest-King",
            description: "Eternal priest and reigning king",
            fulfillment: "Jesus is both our High Priest and King"
          }
        ],
        keyGospelConnections: [
          "Messianic psalms prophesy Christ's suffering and glory",
          "Davidic covenant promises fulfilled in Jesus",
          "Worship and prayer find their perfection in Christ"
        ]
      },

      isaiah: {
        gospelThemes: ["sacrifice", "kingship"],
        christTypes: [
          {
            passage: "Isaiah 7:14",
            type: "Virgin birth prophecy",
            description: "Immanuel - God with us",
            fulfillment: "Jesus born of a virgin as God incarnate"
          },
          {
            passage: "Isaiah 53",
            type: "Suffering Servant",
            description: "Detailed prophecy of substitutionary atonement",
            fulfillment: "Jesus bore our sins and was pierced for our transgressions"
          }
        ],
        keyGospelConnections: [
          "Prophecies of Messiah's birth, ministry, death, and resurrection",
          "The Servant Songs describe Jesus' redemptive work",
          "God's glory revealed in salvation"
        ]
      },

      matthew: {
        gospelThemes: ["kingship", "newCovenant"],
        christTypes: [
          {
            passage: "Matthew 1:1",
            type: "Son of David, Son of Abraham",
            description: "Fulfillment of covenantal promises",
            fulfillment: "Jesus inherits both royal and blessing promises"
          }
        ],
        keyGospelConnections: [
          "Jesus as the promised Messiah-King",
          "Fulfillment of Old Testament prophecies",
          "The kingdom of heaven inaugurated"
        ]
      },

      john: {
        gospelThemes: ["creation", "newCovenant"],
        christTypes: [
          {
            passage: "John 1:1-14",
            type: "Word made flesh",
            description: "Divine Son becomes human",
            fulfillment: "The eternal Word tabernacled among us"
          },
          {
            passage: "John 1:29",
            type: "Lamb of God",
            description: "The sacrifice that takes away sin",
            fulfillment: "Jesus is the ultimate Passover Lamb"
          }
        ],
        keyGospelConnections: [
          "Clear presentation of Jesus' deity and humanity",
          "Salvation by faith alone in Christ alone",
          "Eternal life through believing in Jesus"
        ]
      },

      romans: {
        gospelThemes: ["fall", "sacrifice", "newCovenant"],
        keyGospelConnections: [
          "All have sinned and fall short of God's glory",
          "Justification by faith alone apart from works",
          "Christ's righteousness imputed to believers"
        ]
      },

      hebrews: {
        gospelThemes: ["sacrifice", "newCovenant"],
        keyGospelConnections: [
          "Jesus as superior High Priest",
          "Better covenant established on better promises",
          "Once-for-all sacrifice that makes the old obsolete"
        ]
      },

      revelation: {
        gospelThemes: ["kingship", "creation"],
        keyGospelConnections: [
          "Jesus as conquering King and Lamb",
          "New creation where God dwells with His people",
          "Ultimate victory over sin, Satan, and death"
        ]
      }
    },

    // Progressive revelation through biblical history
    progressiveRevelation: [
      {
        period: "Creation to Fall",
        books: ["Genesis 1-3"],
        revelation: "God's perfect design and humanity's need for redemption",
        gospelAdvancement: "The promise of a coming Savior (Genesis 3:15)"
      },
      {
        period: "Patriarchs",
        books: ["Genesis 12-50"],
        revelation: "God's covenant promises to bless all nations",
        gospelAdvancement: "The seed promise narrowed to Abraham's line"
      },
      {
        period: "Exodus and Law",
        books: ["Exodus", "Leviticus", "Numbers", "Deuteronomy"],
        revelation: "God's holiness and the necessity of substitutionary sacrifice",
        gospelAdvancement: "Sacrificial system teaching need for perfect sacrifice"
      },
      {
        period: "Kingdom",
        books: ["1-2 Samuel", "1-2 Kings", "1-2 Chronicles"],
        revelation: "God's plan to rule through an anointed king",
        gospelAdvancement: "Davidic covenant promising eternal kingdom"
      },
      {
        period: "Prophets",
        books: ["Isaiah", "Jeremiah", "Ezekiel", "Daniel", "Minor Prophets"],
        revelation: "Detailed prophecies of Messiah's coming and new covenant",
        gospelAdvancement: "Clear pictures of suffering Servant and reigning King"
      },
      {
        period: "Gospels",
        books: ["Matthew", "Mark", "Luke", "John"],
        revelation: "The Word became flesh - God incarnate among us",
        gospelAdvancement: "Jesus fulfills all prophecies as Messiah"
      },
      {
        period: "Early Church",
        books: ["Acts", "Epistles"],
        revelation: "The gospel proclaimed to all nations",
        gospelAdvancement: "Salvation by grace through faith explained and applied"
      },
      {
        period: "Consummation",
        books: ["Revelation"],
        revelation: "Christ's ultimate victory and new creation",
        gospelAdvancement: "All things made new in the eternal kingdom"
      }
    ],

    // Search tags for filtering content by gospel themes
    searchTags: [
      "creation", "fall", "sin", "redemption", "salvation", "grace", "faith", 
      "covenant", "promise", "sacrifice", "blood", "atonement", "forgiveness",
      "justification", "sanctification", "regeneration", "adoption", "kingdom",
      "messiah", "christ", "cross", "resurrection", "ascension", "return",
      "eternal life", "heaven", "glory", "worship", "holiness", "love"
    ]
  };
};