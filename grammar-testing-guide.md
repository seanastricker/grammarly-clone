# Grammar, Spelling, and Style Checking - Comprehensive Testing Guide

## Overview
This guide provides comprehensive test scenarios to thoroughly evaluate the grammar, spelling, and style checking functionality of WordWise AI.

## Test Environment Setup

### Prerequisites
1. Navigate to the editor page: https://grammarly-clone-b9b49.web.app/editor
2. Ensure you're logged in to access the editor
3. Open browser developer tools (F12) to monitor console logs
4. The system uses enhanced mock detection for demonstration purposes

---

## 📝 **Test Category 1: Grammar Error Detection**

### Subject-Verb Agreement Tests

#### Test 1.1: Singular/Plural Disagreement
**Test Text:**
```
This are a test of grammar checking. These is another test. That are working correctly. Those is broken.
```
**Expected Results:**
- "This are" → should suggest "This is"
- "These is" → should suggest "These are" 
- "That are" → should suggest "That is"
- "Those is" → should suggest "Those are"

#### Test 1.2: Pronoun-Verb Disagreement  
**Test Text:**
```
I are going to the store. He are coming with me. She are staying home. We has finished our work.
```
**Expected Results:**
- "I are" → should suggest "I am"
- "He are" → should suggest "He is"
- "She are" → should suggest "She is"
- "We has" → should suggest "We have"

### Article Usage Tests

#### Test 1.3: Incorrect Article Usage
**Test Text:**
```
I need an car for the trip. He ate a apple yesterday. She bought an book from a university.
```
**Expected Results:**
- "an car" → should suggest "a car"
- "a apple" → should suggest "an apple"
- "an book" → should suggest "a book"

### Common Grammar Mistakes

#### Test 1.4: Modal Verb Errors
**Test Text:**
```
I could of gone to the party. You should of called earlier. We would of helped if you asked.
```
**Expected Results:**
- "could of" → should suggest "could have"
- "should of" → should suggest "should have"
- "would of" → should suggest "would have"

#### Test 1.5: Comparative Errors
**Test Text:**
```
This solution is different than the last one. The results are different than expected.
```
**Expected Results:**
- "different than" → should suggest "different from"

---

## 🔤 **Test Category 2: Spelling Error Detection**

### Common Misspellings

#### Test 2.1: Basic Spelling Mistakes
**Test Text:**
```
I recieve emails daily. Teh meeting is tomorrow. It's realy necesary to seperate these items.
```
**Expected Results:**
- "recieve" → should suggest "receive"
- "Teh" → should suggest "The"
- "realy" → should suggest "really"
- "necesary" → should suggest "necessary"
- "seperate" → should suggest "separate"

#### Test 2.2: Advanced Spelling Mistakes
**Test Text:**
```
The event definately occured last week. We need to accomomdate everyone's schedule.
```
**Expected Results:**
- "definately" → should suggest "definitely"
- "occured" → should suggest "occurred"
- "accomomdate" → should suggest "accommodate"

#### Test 2.3: Commonly Confused Words
**Test Text:**
```
Thier house is wierd. It's alot to handle. This plan is full-proof.
```
**Expected Results:**
- "Thier" → should suggest "Their"
- "wierd" → should suggest "weird"
- "alot" → should suggest "a lot"
- "full-proof" → should suggest "foolproof"

---

## ✨ **Test Category 3: Style Improvement Suggestions**

### Wordiness and Clarity

#### Test 3.1: Redundant Expressions
**Test Text:**
```
The presentation was very very good. It's really quite extremely important. We need to basically understand that that concept.
```
**Expected Results:**
- "very very" → should suggest alternatives like "extremely"
- "really quite extremely" → should suggest removing redundancy
- "basically" → should suggest removal for directness
- "that that" → should suggest removing one "that"

#### Test 3.2: Wordy Phrases
**Test Text:**
```
In order to succeed, we must work hard. Due to the fact that it's raining, we'll stay inside.
```
**Expected Results:**
- "In order to" → should suggest "to"
- "Due to the fact that" → should suggest "because"

#### Test 3.3: Filler Words
**Test Text:**
```
Actually, this is really important. Basically, we need to fix this issue.
```
**Expected Results:**
- "Actually" → should suggest removal
- "Basically" → should suggest removal

---

## 🔧 **Test Category 4: User Interface Functionality**

### Error Highlighting Tests

#### Test 4.1: Visual Error Indicators
**Steps:**
1. Type text with errors from the above categories
2. Verify errors are highlighted with appropriate colors:
   - **Grammar errors**: Red wavy underline
   - **Spelling errors**: Red solid underline  
   - **Style suggestions**: Blue dotted underline

#### Test 4.2: Error Tooltips
**Steps:**
1. Hover over highlighted errors
2. Verify tooltip shows error message and suggestions
3. Test tooltip positioning and visibility

### Suggestions Panel Tests

#### Test 4.3: Error Categories
**Steps:**
1. Create a document with mixed error types
2. Check that suggestions panel shows correct counts:
   - Grammar errors count
   - Spelling errors count
   - Style issues count
   - Total errors count

#### Test 4.4: Filter Functionality
**Steps:**
1. Test filtering by error type (All, Grammar, Spelling, Style)
2. Verify error counts update correctly for each filter
3. Confirm only relevant errors show in filtered view

#### Test 4.5: Suggestion Actions
**Steps:**
1. Test "Apply" button for individual suggestions
2. Test "Dismiss" button for individual errors
3. Test "Accept All" functionality
4. Verify text updates correctly after applying suggestions

### Quality Score Tests

#### Test 4.6: Quality Score Calculation
**Test Scenarios:**
1. **Clean text**: "This is a well-written sentence with perfect grammar."
   - Expected: High quality score (90-100)

2. **Minor issues**: "This are a test with one grammar error."
   - Expected: Medium-high score (80-90)

3. **Multiple errors**: "Teh document has alot of erors that need seperate attention."
   - Expected: Lower score (60-80)

4. **Poor quality**: "Teh writing are very very bad and has alot of erors seperate through-out."
   - Expected: Low score (0-60)

---

## ⚡ **Test Category 5: Performance and Real-time Analysis**

### Debouncing Tests

#### Test 5.1: Real-time Analysis
**Steps:**
1. Type continuously and observe when analysis triggers
2. Verify there's a delay (debouncing) before analysis starts
3. Check console logs for analysis timing

#### Test 5.2: Large Document Performance
**Test Text:** Create a 1000+ word document with multiple errors
**Steps:**
1. Paste large text block
2. Measure analysis time (should complete within 2-3 seconds)
3. Verify UI remains responsive during analysis

### Error Persistence Tests

#### Test 5.3: Dismissed Error Memory
**Steps:**
1. Dismiss a specific error
2. Make minor edits to the document
3. Verify the dismissed error doesn't reappear
4. Make major changes and verify dismissed errors reset

---

## 🧪 **Test Category 6: Edge Cases and Error Handling**

### Edge Case Tests

#### Test 6.1: Empty and Minimal Content
**Test Cases:**
- Empty document
- Single character
- Single word
- Very short sentences

#### Test 6.2: Special Characters and Formatting
**Test Text:**
```
This is a test with numbers 123 and symbols @#$. 
The email address test@example.com should be ignored.
URLs like https://example.com should not trigger errors.
```

#### Test 6.3: Mixed Languages (if supported)
**Test Text:**
```
This is English text with some français words mixed in.
```

---

## 📊 **Expected System Behavior**

### Analysis Timing
- **Debounce delay**: 1 second after typing stops
- **Analysis duration**: 0.5-2 seconds depending on text length
- **UI responsiveness**: Should remain responsive during analysis

### Error Detection Accuracy
- **Grammar errors**: Should catch 80%+ of common mistakes
- **Spelling errors**: Should catch 95%+ of misspellings  
- **Style suggestions**: Should provide helpful but not overwhelming suggestions

### User Experience
- **Visual feedback**: Clear, non-intrusive error highlighting
- **Helpful suggestions**: Actionable alternatives for errors
- **Performance**: Smooth real-time analysis without lag

---

## 🚀 **How to Run These Tests**

### Quick Test (15 minutes)
1. Pick 2-3 test cases from each category
2. Focus on basic grammar and spelling errors
3. Test apply/dismiss functionality

### Comprehensive Test (45 minutes)  
1. Run all test categories systematically
2. Document any unexpected behavior
3. Test edge cases and performance scenarios

### Stress Test (30 minutes)
1. Create documents with 50+ errors
2. Test rapid typing and editing
3. Test bulk actions (Accept All, etc.)

---

## 📋 **Test Results Template**

### Test Results Checklist
- [ ] Grammar errors detected correctly
- [ ] Spelling errors detected correctly  
- [ ] Style suggestions provided appropriately
- [ ] Error highlighting works visually
- [ ] Suggestions panel functions properly
- [ ] Apply suggestions works correctly
- [ ] Dismiss errors works correctly
- [ ] Quality score calculates reasonably
- [ ] Performance is acceptable
- [ ] No console errors during testing

### Issues to Document
- Errors not detected that should be
- False positives (correct text marked as errors)
- UI/UX issues
- Performance problems
- Console errors or warnings

---

Ready to begin testing! Start with the Quick Test scenarios and let me know what you discover. 🎯 