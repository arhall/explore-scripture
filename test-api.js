// Test script to verify chapter reader API functionality
const { ChapterReader } = require('./src/assets/chapter-reader.js');

async function testChapterReader() {
    console.log('Testing Chapter Reader...');
    
    const reader = new ChapterReader();
    
    try {
        // Test Genesis 7 ESV
        console.log('\nTesting Genesis 7 with ESV...');
        const genesis7 = await reader.fetchChapter('Genesis 7', 'esv');
        
        console.log(`Reference: ${genesis7.reference}`);
        console.log(`Translation: ${genesis7.translation}`);
        console.log(`Verse count: ${genesis7.verses.length}`);
        
        // Check verse 9 specifically
        const verse9 = genesis7.verses.find(v => v.number === 9);
        if (verse9) {
            console.log(`\nGenesis 7:9: "${verse9.text}"`);
            
            if (verse9.text.includes('two and two, male and female, went into the ark with Noah')) {
                console.log('✅ SUCCESS: Genesis 7:9 shows correct ESV text!');
            } else {
                console.log('❌ ISSUE: Genesis 7:9 text does not match expected ESV');
            }
        } else {
            console.log('❌ ERROR: Could not find verse 9');
        }
        
    } catch (error) {
        console.error('❌ ERROR:', error.message);
    }
}

// Run the test if this script is executed directly
if (require.main === module) {
    testChapterReader();
}