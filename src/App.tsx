
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './App.css';
import { persistence } from './utils/persistence';

interface WeekData {
  week: number;
  theme: string;
  description: string;
  learningGoals: string[];
  coreWords: string[];
  days: DayData[];
}

interface DayData {
  day: number;
  dayName: string;
  literacyHabit: ActivityBlock;
  gardenObservation: ActivityBlock;
  scienceLab: ActivityBlock;
  mathBlock: ActivityBlock;
  readingWriting: ActivityBlock;
  oralReflection: ActivityBlock;
}

interface ActivityBlock {
  time: string;
  title: string;
  activities: string[];
}

type BlockKey =
  | 'literacyHabit'
  | 'gardenObservation'
  | 'scienceLab'
  | 'mathBlock'
  | 'readingWriting'
  | 'oralReflection';

interface LessonAsset {
  week: number;
  days: number[];
  block: BlockKey;
  time: string;
  lesson: string;
  label: string;
  file: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

interface ProgressData {
  completedActivities: string[];
  currentWeek: number;
  currentDay: number;
  notes: string[];
  streak: number;
  lastActiveDate: string;
  achievements: string[];
}

const CURRICULUM: WeekData[] = [
  {
    week: 1,
    theme: "Water & Sun",
    description: "What Do Plants Need?",
    learningGoals: [
      "Science: Plants need water and sunlight to survive",
      "Math: Measure in cm, compare quantities, count to 15",
      "Reading: Recognize 3-5 words (sun, water, plant, soil)",
      "Writing: Trace/copy single words only"
    ],
    coreWords: ["sun", "water", "plant", "soil"],
    days: [
      {
        day: 1,
        dayName: "Monday",
        literacyHabit: { time: "1:00-1:15 PM", title: "Daily 15-Minute Literacy Habit", activities: ["1:00-1:05: Sound Warm-Up - Blend: c-a-t, s-u-n", "1:05-1:10: Reread Same Decodable Book (same all week)", "1:10-1:15: Gentle Copy - Copy 1 short sentence OR 3 simple words"] },
        gardenObservation: { time: "1:15-1:25 PM", title: "Garden Care & Observation", activities: ["Water existing plants normally", "Ask: 'What does this plant need?' Let him answer freely", "No corrections, just listening to his reasoning"] },
        scienceLab: { time: "1:25-2:10 PM", title: "Science Lab: Setting Up Experiment", activities: ["1:25-1:40: Choose 3 similar small plants/pots", "1:40-1:55: Have him label each pot (you write, he traces)", "1:55-2:10: Ask predictions - 'What will happen to each?'"] },
        mathBlock: { time: "2:25-3:10 PM", title: "Math Block", activities: ["2:25-2:40: Measure all 3 plants in cm", "2:40-2:55: Compare heights - Which is tallest/shortest?", "2:55-3:10: Simple story problem with cubes"] },
        readingWriting: { time: "3:20-3:45 PM", title: "Reading + Writing (VERY LIGHT)", activities: ["3:20-3:30: Word matching - Match sun, water, plant, soil to objects", "3:30-3:38: Read 2 simple sentences together", "3:38-3:45: Copy ONE word of his choice"] },
        oralReflection: { time: "3:45-4:00 PM", title: "Oral Reflection", activities: ["'What might happen tomorrow?' - Let him stand and explain full prediction"] }
      },
      {
        day: 2,
        dayName: "Tuesday",
        literacyHabit: { time: "1:00-1:15 PM", title: "Daily 15-Minute Literacy Habit", activities: ["1:00-1:05: Sound Warm-Up - Blend: m-a-p, d-o-g", "1:05-1:10: Reread Same Book from yesterday", "1:10-1:15: Gentle Copy - Copy 1 short sentence OR 3 words"] },
        gardenObservation: { time: "1:15-1:25 PM", title: "Garden Observation", activities: ["Look at all 3 plants carefully", "Ask: 'What looks the same? What looks different?'"] },
        scienceLab: { time: "1:25-2:10 PM", title: "Science Lab: Soil Moisture", activities: ["1:25-1:40: Touch soil in all 3 pots - Compare wet vs dry", "1:40-1:55: Which plant has no water? Discuss what will happen", "1:55-2:10: Update experiment drawings"] },
        mathBlock: { time: "2:25-3:10 PM", title: "Math Block", activities: ["2:25-2:40: Re-measure all 3 plants, compare to yesterday", "2:40-2:55: Count leaves on each plant", "2:55-3:10: Story problem with real objects"] },
        readingWriting: { time: "3:20-3:45 PM", title: "Reading + Writing", activities: ["3:20-3:30: Review yesterday's 4 words", "3:30-3:38: Add word: grow - Blend slowly g-r-ow", "3:38-3:45: Copy one word of choice"] },
        oralReflection: { time: "3:45-4:00 PM", title: "Oral Reflection", activities: ["'Which plant do you think will change most? Why?'"] }
      },
      {
        day: 3,
        dayName: "Wednesday",
        literacyHabit: { time: "1:00-1:15 PM", title: "Daily 15-Minute Literacy Habit", activities: ["1:00-1:05: Sound Warm-Up - Blend: l-o-g, p-i-g", "1:05-1:10: Reread Same Book (3rd day)", "1:10-1:15: Gentle Copy - Copy 1 short sentence OR 3 words"] },
        gardenObservation: { time: "1:15-1:25 PM", title: "Garden Care", activities: ["Check plants, but do NOT water Plant B (no water test)"] },
        scienceLab: { time: "1:25-2:10 PM", title: "Science Lab: Sun Direction", activities: ["1:25-1:40: Observe which way leaves face", "1:40-1:55: Turn one plant slightly - Ask what might happen", "1:55-2:10: Draw leaf direction with arrows"] },
        mathBlock: { time: "2:25-3:10 PM", title: "Math Block", activities: ["2:25-2:40: Measure heights again, compare to Mon & Tue", "2:40-2:55: Add up total height change", "2:55-3:10: Compare plant positions - sun vs shade"] },
        readingWriting: { time: "3:20-3:45 PM", title: "Reading + Writing", activities: ["3:20-3:30: Word review - sun, water, plant, soil, grow (5 words)", "3:30-3:38: Read simple sentences", "3:38-3:45: Draw and label - He draws, you write label, he traces"] },
        oralReflection: { time: "3:45-4:00 PM", title: "Oral Reflection", activities: ["'Why do leaves turn toward the sun?'"] }
      },
      {
        day: 4,
        dayName: "Thursday",
        literacyHabit: { time: "1:00-1:15 PM", title: "Daily 15-Minute Literacy Habit", activities: ["1:00-1:05: Sound Warm-Up - Blend: h-o-t, r-a-n", "1:05-1:10: Reread Same Book (4th day)", "1:10-1:15: Gentle Copy - Copy 1 short sentence OR 3 words"] },
        gardenObservation: { time: "1:15-1:25 PM", title: "Garden Observation", activities: ["Look for any visible changes"] },
        scienceLab: { time: "1:25-2:10 PM", title: "Science Lab: Recording Changes", activities: ["1:25-1:40: Measure all plants again", "1:40-1:55: Compare Plant B (no water) to others", "1:55-2:10: Draw simple growth chart with 3 lines"] },
        mathBlock: { time: "2:25-3:10 PM", title: "Math Block", activities: ["2:25-2:40: Subtract to find differences - tallest minus shortest", "2:40-2:55: Add leaf counts across all plants", "2:55-3:10: Pattern noticing - Which plant is changing fastest?"] },
        readingWriting: { time: "3:20-3:45 PM", title: "Reading + Writing", activities: ["3:20-3:30: Word matching game - Hide cards around garden", "3:30-3:38: Reread familiar sentences for confidence", "3:38-3:45: Write one sentence OR copy 3 words - his choice"] },
        oralReflection: { time: "3:45-4:00 PM", title: "Oral Reflection", activities: ["'What surprised you this week?'"] }
      },
      {
        day: 5,
        dayName: "Friday",
        literacyHabit: { time: "1:00-1:15 PM", title: "Daily 15-Minute Literacy Habit", activities: ["1:00-1:05: Sound Warm-Up - Review sounds from week", "1:05-1:10: Reread Same Book (5th day - celebrate!)", "1:10-1:15: Gentle Copy - Copy 1 short sentence OR 3 words"] },
        gardenObservation: { time: "1:15-1:25 PM", title: "Final Weekly Observation", activities: ["Compare all plants to Monday"] },
        scienceLab: { time: "1:25-2:10 PM", title: "Science Lab: Weekly Conclusions", activities: ["1:25-1:40: Final measurements", "1:40-1:55: Compare results - What happened to Plant B & C?", "1:55-2:10: Draw final comparison - 3 simple drawings"] },
        mathBlock: { time: "2:25-3:10 PM", title: "Math Block", activities: ["2:25-2:40: Add all growth from week using physical counters", "2:40-2:55: Create simple bar graph - 3 bars showing heights", "2:55-3:10: 3 real-number story problems using actual measurements"] },
        readingWriting: { time: "3:20-3:45 PM", title: "Reading + Writing", activities: ["3:20-3:30: Word review - confidence check", "3:30-3:38: Read familiar passage - no new material on Friday", "3:38-3:45: Weekly summary (ORAL) - you scribe, he copies ONE sentence"] },
        oralReflection: { time: "3:45-4:00 PM", title: "Weekly Presentation", activities: ["He stands and explains: What we tested, what happened, what plants need", "You ask ONE follow-up question", "NO writing required during presentation"] }
      }
    ]
  },
  {
    week: 2,
    theme: "Roots & Germination",
    description: "What Happens Under the Soil?",
    learningGoals: ["Science: Seeds sprout, roots grow down and anchor plants", "Math: Measure depth, compare lengths, add/subtract within 15", "Reading: 5 core words (seed, root, plant, grow, soil)", "Writing: Trace words, copy single words"],
    coreWords: ["seed", "root", "plant", "grow", "soil"],
    days: [
      { day: 1, dayName: "Monday", literacyHabit: { time: "1:00-1:15 PM", title: "Daily 15-Minute Literacy Habit", activities: ["1:00-1:05: Sound Warm-Up - Blend: b-a-t, f-a-n", "1:05-1:10: Reread Same Decodable Book (new for Week 2)", "1:10-1:15: Gentle Copy - Copy 1 short sentence OR 3 words"] }, gardenObservation: { time: "1:15-1:25 PM", title: "Garden Observation", activities: ["Look at existing plants", "Ask: 'Where did this plant start?'"] }, scienceLab: { time: "1:25-2:10 PM", title: "Science Lab: Planting for Visibility", activities: ["1:25-1:40: Fill 2 clear cups with soil, plant beans near side", "1:40-1:55: Ask: 'What part will grow first?' Let him hypothesize", "1:55-2:10: Draw seed in soil - He draws, you label 'seed', he traces"] }, mathBlock: { time: "2:25-3:10 PM", title: "Math Block", activities: ["2:25-2:40: Measure planting depth in cm", "2:40-2:55: Compare two depths - Which deeper? How much?", "2:55-3:10: Story problem - '3 seeds + 2 seeds = ?'"] }, readingWriting: { time: "3:20-3:45 PM", title: "Reading + Writing", activities: ["3:20-3:30: Blend NEW words: s-eed, r-oot", "3:30-3:38: Match words to pictures", "3:38-3:45: Copy one word: seed OR root"] }, oralReflection: { time: "3:45-4:00 PM", title: "Oral Reflection", activities: ["'What do you think will happen first?'"] } },
      { day: 2, dayName: "Tuesday", literacyHabit: { time: "1:00-1:15 PM", title: "Daily 15-Minute Literacy Habit", activities: ["1:00-1:05: Sound Warm-Up - Blend: s-i-t, h-i-t", "1:05-1:10: Reread Same Book (2nd day)", "1:10-1:15: Gentle Copy"] }, gardenObservation: { time: "1:15-1:25 PM", title: "Observe Cups", activities: ["Look carefully for any changes"] }, scienceLab: { time: "1:25-2:10 PM", title: "Science Lab: Seed Swelling", activities: ["1:25-1:40: Observe if seeds changed size", "1:40-1:55: Discuss: 'Why is the seed getting bigger?'", "1:55-2:10: Draw what he sees"] }, mathBlock: { time: "2:25-3:10 PM", title: "Math Block", activities: ["2:25-2:40: Count days since planting", "2:40-2:55: Add 1 for each day - use one cube per day", "2:55-3:10: Predict: 'In 5 more days, how many total?'"] }, readingWriting: { time: "3:20-3:45 PM", title: "Reading + Writing", activities: ["3:20-3:30: Review all 5 words", "3:30-3:38: Read simple sentences", "3:38-3:45: Trace or copy one word"] }, oralReflection: { time: "3:45-4:00 PM", title: "Oral Reflection", activities: ["'How long do we need to wait?'"] } },
      { day: 3, dayName: "Wednesday", literacyHabit: { time: "1:00-1:15 PM", title: "Daily 15-Minute Literacy Habit", activities: ["1:00-1:05: Sound Warm-Up - Blend: n-a-p, t-a-p", "1:05-1:10: Reread Same Book (3rd day)", "1:10-1:15: Gentle Copy"] }, gardenObservation: { time: "1:15-1:25 PM", title: "Check for Roots", activities: ["Look for tiny root tip"] }, scienceLab: { time: "1:25-2:10 PM", title: "Science Lab: Root Direction", activities: ["1:25-1:40: If root visible, observe direction - Root grows DOWN", "1:40-1:55: Use body to demonstrate - Arms down = roots, Arms up = stem", "1:55-2:10: Draw root growing down with arrow"] }, mathBlock: { time: "2:25-3:10 PM", title: "Math Block", activities: ["2:25-2:40: Measure visible root (if any)", "2:40-2:55: Compare root lengths", "2:55-3:10: Add growth predictions"] }, readingWriting: { time: "3:20-3:45 PM", title: "Reading + Writing", activities: ["3:20-3:30: Word review - quick match", "3:30-3:38: Read familiar sentences again", "3:38-3:45: Draw and label - draw seed with root, he traces 'root'"] }, oralReflection: { time: "3:45-4:00 PM", title: "Oral Reflection", activities: ["'Why do roots grow down?'"] } },
      { day: 4, dayName: "Thursday", literacyHabit: { time: "1:00-1:15 PM", title: "Daily 15-Minute Literacy Habit", activities: ["1:00-1:05: Sound Warm-Up - Blend: b-i-g, d-i-g", "1:05-1:10: Reread Same Book (4th day)", "1:10-1:15: Gentle Copy"] }, gardenObservation: { time: "1:15-1:25 PM", title: "Observation", activities: ["Check root growth progress"] }, scienceLab: { time: "1:25-2:10 PM", title: "Science Lab: Stability Test", activities: ["1:25-1:40: Carefully dig up one small plant - Show root system", "1:40-1:55: Discuss: 'What do roots do?' - Anchor plant, drink water", "1:55-2:10: Compare root vs stem - Which is longer usually?"] }, mathBlock: { time: "2:25-3:10 PM", title: "Math Block", activities: ["2:25-2:40: Measure root length vs stem length", "2:40-2:55: Subtract difference", "2:55-3:10: Add root + stem = total plant length"] }, readingWriting: { time: "3:20-3:45 PM", title: "Reading + Writing", activities: ["3:20-3:30: Word recognition check - show 5 words, have him point", "3:30-3:38: Read short paragraph (4-5 sentences)", "3:38-3:45: Write one sentence OR copy 2 words - his choice"] }, oralReflection: { time: "3:45-4:00 PM", title: "Oral Reflection", activities: ["'What would happen without roots?'"] } },
      { day: 5, dayName: "Friday", literacyHabit: { time: "1:00-1:15 PM", title: "Daily 15-Minute Literacy Habit", activities: ["1:00-1:05: Sound Warm-Up - Review challenging sounds", "1:05-1:10: Reread Same Book (5th day)", "1:10-1:15: Gentle Copy"] }, gardenObservation: { time: "1:15-1:25 PM", title: "Final Root Check", activities: ["Celebrate any growth visible"] }, scienceLab: { time: "1:25-2:10 PM", title: "Science Lab: Germination Review", activities: ["1:25-1:40: Review stages seen this week", "1:40-1:55: Draw full sequence - Seed -> Root -> (maybe stem)", "1:55-2:10: Discuss what comes next"] }, mathBlock: { time: "2:25-3:10 PM", title: "Math Block", activities: ["2:25-2:40: Add up all measurements from week", "2:40-2:55: Compare cups - Which grew fastest?", "2:55-3:10: 3 story problems with real numbers"] }, readingWriting: { time: "3:20-3:45 PM", title: "Reading + Writing", activities: ["3:20-3:30: Final word review - recognize all 5 confidently", "3:30-3:38: Reread familiar text", "3:38-3:45: You scribe his weekly summary, he copies one sentence"] }, oralReflection: { time: "3:45-4:00 PM", title: "Weekly Presentation", activities: ["He explains: What germination means, What grows first, Why roots important", "NO writing during presentation"] } }
    ]
  },
  {
    week: 3,
    theme: "Soil & Compost",
    description: "Soil Is Alive",
    learningGoals: ["Science: Soil holds water and nutrients, compost feeds soil", "Math: Measure depth, compare quantities, simple bar graphs", "Reading: 5 core words (soil, wet, dry, plant, root)", "Writing: Copy words, trace labels"],
    coreWords: ["soil", "wet", "dry", "plant", "root"],
    days: Array(5).fill(null).map((_, i) => ({
      day: i + 1, dayName: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"][i],
      literacyHabit: { time: "1:00-1:15 PM", title: "Daily 15-Minute Literacy Habit", activities: ["1:00-1:05: Sound Warm-Up - Blend sounds for new words", "1:05-1:10: Reread Same Decodable Book", "1:10-1:15: Gentle Copy"] },
      gardenObservation: { time: "1:15-1:25 PM", title: ["Garden Observation", "Garden Care", "Check Compost", "Check Plants", "Final Observations"][i], activities: [""] },
      scienceLab: { time: "1:25-2:10 PM", title: "Science Lab: Soil Discovery", activities: ["1:25-1:40: Explore soil and compost", "1:40-1:55: Compare different soils", "1:55-2:10: Make predictions"] },
      mathBlock: { time: "2:25-3:10 PM", title: "Math Block", activities: ["2:25-2:40: Measure and compare", "2:40-2:55: Count and add", "2:55-3:10: Story problems"] },
      readingWriting: { time: "3:20-3:45 PM", title: "Reading + Writing", activities: ["3:20-3:30: Word work", "3:30-3:38: Read sentences", "3:38-3:45: Copy words"] },
      oralReflection: { time: "3:45-4:00 PM", title: "Oral Reflection", activities: ["Discuss discoveries"] }
    }))
  },
  {
    week: 4,
    theme: "Leaves & Light",
    description: "Leaves Are Solar Panels",
    learningGoals: ["Science: Leaves collect sunlight for plant energy", "Math: Measure leaf size, compare quantities, early graphing", "Reading: 5 core words (leaf, sun, plant, light, grow)", "Writing: Copy words, simple labels"],
    coreWords: ["leaf", "sun", "plant", "light", "grow"],
    days: Array(5).fill(null).map((_, i) => ({
      day: i + 1, dayName: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"][i],
      literacyHabit: { time: "1:00-1:15 PM", title: "Daily 15-Minute Literacy Habit", activities: ["1:00-1:05: Sound Warm-Up - Blend CVC words", "1:05-1:10: Reread Same Book", "1:10-1:15: Gentle Copy"] },
      gardenObservation: { time: "1:15-1:25 PM", title: ["Leaf Hunt", "Garden Observation", "Check Leaf Direction", "Measure Plants Again", "Final Measurements"][i], activities: [""] },
      scienceLab: { time: "1:25-2:10 PM", title: "Science Lab: Leaf Adventure", activities: ["1:25-1:40: Explore leaves", "1:40-1:55: Test light and leaves", "1:55-2:10: Draw discoveries"] },
      mathBlock: { time: "2:25-3:10 PM", title: "Math Block", activities: ["2:25-2:40: Measure leaves", "2:40-2:55: Compare sizes", "2:55-3:10: Count and add"] },
      readingWriting: { time: "3:20-3:45 PM", title: "Reading + Writing", activities: ["3:20-3:30: Word work", "3:30-3:38: Read sentences", "3:38-3:45: Draw and label"] },
      oralReflection: { time: "3:45-4:00 PM", title: "Oral Reflection", activities: ["Discuss leaf discoveries"] }
    }))
  },
  {
    week: 5,
    theme: "Irrigation & Water",
    description: "How Can We Water Better?",
    learningGoals: ["Science: Water can be delivered slowly and evenly", "Math: Count drops, measure time, simple multiplication foundation", "Reading: 5 core words (water, drip, wet, dry, soil)", "Writing: Copy words, simple labels"],
    coreWords: ["water", "drip", "wet", "dry", "soil"],
    days: Array(5).fill(null).map((_, i) => ({
      day: i + 1, dayName: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"][i],
      literacyHabit: { time: "1:00-1:15 PM", title: "Daily 15-Minute Literacy Habit", activities: ["1:00-1:05: Sound Warm-Up - Different CVC blends each day", "1:05-1:10: Reread Same Decodable Book", "1:10-1:15: Gentle Copy - Copy 1 short sentence OR 3 words"] },
      gardenObservation: { time: "1:15-1:25 PM", title: ["Check Soil Moisture", "Check Soil from Drip", "Measure Water Level", "Compare Hand vs Drip", "Final Drip Test"][i], activities: [""] },
      scienceLab: { time: "1:25-2:10 PM", title: "Science Lab: Drip System", activities: ["1:25-1:40: Build and test drip bottle", "1:40-1:55: Test different hole sizes", "1:55-2:10: Compare results"] },
      mathBlock: { time: "2:25-3:10 PM", title: "Math Block", activities: ["2:25-2:40: Count drops per minute", "2:40-2:55: Double and compare", "2:55-3:10: Story problems"] },
      readingWriting: { time: "3:20-3:45 PM", title: "Reading + Writing", activities: ["3:20-3:30: Word work", "3:30-3:38: Read sentences", "3:38-3:45: Copy words"] },
      oralReflection: { time: "3:45-4:00 PM", title: "Oral Reflection", activities: ["'How does the drip help?'"] }
    }))
  },
  {
    week: 6,
    theme: "Growth & Change",
    description: "Plants Grow Slowly",
    learningGoals: ["Science: Plants change slowly over days; growth takes time", "Math: Track changes, add measurements, compare data", "Reading: 5 core words (plant, grow, tall, short, time)", "Writing: Copy words, trace measurements"],
    coreWords: ["plant", "grow", "tall", "short", "time"],
    days: Array(5).fill(null).map((_, i) => ({
      day: i + 1, dayName: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"][i],
      literacyHabit: { time: "1:00-1:15 PM", title: "Daily 15-Minute Literacy Habit", activities: ["1:00-1:05: Sound Warm-Up - Review sounds", "1:05-1:10: Reread Same Book", "1:10-1:15: Gentle Copy"] },
      gardenObservation: { time: "1:15-1:25 PM", title: ["Choose Focus Plant", "Count Leaves", "Measure Again", "Observe Changes", "Final Measurement"][i], activities: [""] },
      scienceLab: { time: "1:25-2:10 PM", title: "Science Lab: Growth Tracking", activities: ["1:25-1:40: Measure plant carefully", "1:40-1:55: Track and record changes", "1:55-2:10: Draw growth chart"] },
      mathBlock: { time: "2:25-3:10 PM", title: "Math Block", activities: ["2:25-2:40: Measure and compare", "2:40-2:55: Calculate growth", "2:55-3:10: Story problems"] },
      readingWriting: { time: "3:20-3:45 PM", title: "Reading + Writing", activities: ["3:20-3:30: Word work", "3:30-3:38: Read sentences", "3:38-3:45: Copy/trace"] },
      oralReflection: { time: "3:45-4:00 PM", title: "Oral Reflection", activities: ["Discuss growth progress"] }
    }))
  },
  {
    week: 7,
    theme: "Garden Grid",
    description: "Organizing Plants in Rows",
    learningGoals: ["Science: Plants need spacing; organization helps care", "Math: Count in groups (2s, 3s, 5s), early multiplication concept", "Reading: 5 core words (row, plant, sun, space, count)", "Writing: Copy words, draw layouts"],
    coreWords: ["row", "plant", "sun", "space", "count"],
    days: Array(5).fill(null).map((_, i) => ({
      day: i + 1, dayName: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"][i],
      literacyHabit: { time: "1:00-1:15 PM", title: "Daily 15-Minute Literacy Habit", activities: ["1:00-1:05: Sound Warm-Up - Blend sh, ch, th sounds", "1:05-1:10: Reread Same Book", "1:10-1:15: Gentle Copy"] },
      gardenObservation: { time: "1:15-1:25 PM", title: ["Look at Garden Space", "Check Sun Direction", "Review Row Layout", "Check Real Plant Rows", "Final Layout Plan"][i], activities: [""] },
      scienceLab: { time: "1:25-2:10 PM", title: "Science Lab: Row Organization", activities: ["1:25-1:40: Build rows with objects", "1:40-1:55: Measure spacing", "1:55-2:10: Design layout"] },
      mathBlock: { time: "2:25-3:10 PM", title: "Math Block - Counting in Groups", activities: ["2:25-2:40: Count by 2s: 2, 4, 6, 8", "2:40-2:55: Count by 3s: 3, 6, 9", "2:55-3:10: Count by 5s: 5, 10, 15"] },
      readingWriting: { time: "3:20-3:45 PM", title: "Reading + Writing", activities: ["3:20-3:30: Word work - row, space", "3:30-3:38: Read 'Plants grow in rows'", "3:38-3:45: Copy and draw"] },
      oralReflection: { time: "3:45-4:00 PM", title: "Oral Reflection", activities: ["'Why are rows helpful?'"] }
    }))
  },
  {
    week: 8,
    theme: "Garden Ecosystem",
    description: "Who Lives in the Garden?",
    learningGoals: ["Science: Bugs help and sometimes hurt plants; balance matters", "Math: Count and categorize, simple bar graphs", "Reading: 5 core words (bug, worm, help, eat, leaf)", "Writing: Copy words, draw insects"],
    coreWords: ["bug", "worm", "help", "eat", "leaf"],
    days: Array(5).fill(null).map((_, i) => ({
      day: i + 1, dayName: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"][i],
      literacyHabit: { time: "1:00-1:15 PM", title: "Daily 15-Minute Literacy Habit", activities: ["1:00-1:05: Sound Warm-Up - Blend tr, cr, dr sounds", "1:05-1:10: Reread Same Book", "1:10-1:15: Gentle Copy"] },
      gardenObservation: { time: "1:15-1:25 PM", title: ["Quiet Observation", "Check Leaves for Damage", "Look Underground", "Check Plant Health", "Final Bug Count"][i], activities: [""] },
      scienceLab: { time: "1:25-2:10 PM", title: "Science Lab: Garden Bugs", activities: ["1:25-1:40: Bug hunt - look under leaves", "1:40-1:55: Observe and categorize bugs", "1:55-2:10: Discuss ecosystem"] },
      mathBlock: { time: "2:25-3:10 PM", title: "Math Block", activities: ["2:25-2:40: Categorize bug counts", "2:40-2:55: Compare and add", "2:55-3:10: Create bar graph"] },
      readingWriting: { time: "3:20-3:45 PM", title: "Reading + Writing", activities: ["3:20-3:30: Word work", "3:30-3:38: Read about bugs", "3:38-3:45: Draw and label"] },
      oralReflection: { time: "3:45-4:00 PM", title: "Oral Reflection", activities: ["'What were the bugs doing?'"] }
    }))
  },
  {
    week: 9,
    theme: "Seeds & Groups",
    description: "Counting Seeds Together",
    learningGoals: ["Science: Seeds come from plants; can be saved and planted", "Math: Count in groups of 2, 3, 5; early multiplication concept", "Reading: 5 core words (seed, group, plant, save, count)", "Writing: Copy words, draw groups"],
    coreWords: ["seed", "group", "plant", "save", "count"],
    days: Array(5).fill(null).map((_, i) => ({
      day: i + 1, dayName: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"][i],
      literacyHabit: { time: "1:00-1:15 PM", title: "Daily 15-Minute Literacy Habit", activities: ["1:00-1:05: Sound Warm-Up - Blend bl, sl, tr sounds", "1:05-1:10: Reread Same Book", "1:10-1:15: Gentle Copy"] },
      gardenObservation: { time: "1:15-1:25 PM", title: ["Find Mature Seeds", "Review Seed Collection", "Prepare Planting Area", "Check Planted Seeds", "Final Seed Count"][i], activities: [""] },
      scienceLab: { time: "1:25-2:10 PM", title: "Science Lab: Seed Collection", activities: ["1:25-1:40: Collect and sort seeds", "1:40-1:55: Make groups of 2, 3, 5", "1:55-2:10: Plant seeds in rows"] },
      mathBlock: { time: "2:25-3:10 PM", title: "Math Block - Group Counting", activities: ["2:25-2:40: Make groups of 2, count by 2s", "2:40-2:55: Make groups of 3, count by 3s", "2:55-3:10: Compare grouping vs counting individually"] },
      readingWriting: { time: "3:20-3:45 PM", title: "Reading + Writing", activities: ["3:20-3:30: Word work - seed, group", "3:30-3:38: Read 'Seeds grow into plants'", "3:38-3:45: Copy and draw"] },
      oralReflection: { time: "3:45-4:00 PM", title: "Oral Reflection", activities: ["'Where do seeds come from?'"] }
    }))
  },
  {
    week: 10,
    theme: "Harvest & Sharing",
    description: "Growing Food to Share",
    learningGoals: ["Science: We harvest when plants are ready; we can share equally", "Math: Divide into equal groups; understand 'leftover'", "Reading: 5 core words (harvest, share, cut, equal, food)", "Writing: Copy words, record harvest"],
    coreWords: ["harvest", "share", "cut", "equal", "food"],
    days: Array(5).fill(null).map((_, i) => ({
      day: i + 1, dayName: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"][i],
      literacyHabit: { time: "1:00-1:15 PM", title: "Daily 15-Minute Literacy Habit", activities: ["1:00-1:05: Sound Warm-Up - Blend spr, str, scr sounds", "1:05-1:10: Reread Same Book", "1:10-1:15: Gentle Copy"] },
      gardenObservation: { time: "1:15-1:25 PM", title: ["Check Ready Plants", "Review Harvest", "Count Harvest", "Prepare Snack", "Final Harvest Count"][i], activities: [""] },
      scienceLab: { time: "1:25-2:10 PM", title: "Science Lab: Harvest & Share", activities: ["1:25-1:40: Harvest carefully", "1:40-1:55: Cut in half / divide equally", "1:55-2:10: Share between 2, 3, 4 people"] },
      mathBlock: { time: "2:25-3:10 PM", title: "Math Block - Division Basics", activities: ["2:25-2:40: Divide between 2 people", "2:40-2:55: Divide between 3 people", "2:55-3:10: Handle remainders"] },
      readingWriting: { time: "3:20-3:45 PM", title: "Reading + Writing", activities: ["3:20-3:30: Word work - harvest, share", "3:30-3:38: Read 'We share the food'", "3:38-3:45: Copy and draw"] },
      oralReflection: { time: "3:45-4:00 PM", title: "Oral Reflection", activities: ["'Is this fair?'"] }
    }))
  },
  {
    week: 11,
    theme: "Weather & Plants",
    description: "How Weather Affects Growth",
    learningGoals: ["Science: Weather (sun, rain, temperature) affects plant growth", "Math: Track weather days, compare patterns", "Reading: 5 core words (sun, rain, hot, cold, weather)", "Writing: Copy words, record weather"],
    coreWords: ["sun", "rain", "hot", "cold", "weather"],
    days: Array(5).fill(null).map((_, i) => ({
      day: i + 1, dayName: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"][i],
      literacyHabit: { time: "1:00-1:15 PM", title: "Daily 15-Minute Literacy Habit", activities: ["1:00-1:05: Sound Warm-Up - Blend pl, st, w sounds", "1:05-1:10: Reread Same Book", "1:10-1:15: Gentle Copy"] },
      gardenObservation: { time: "1:15-1:25 PM", title: ["Weather Check", "Rain Check", "Weather Observation", "Weekly Weather Review", "Final Weather Count"][i], activities: [""] },
      scienceLab: { time: "1:25-2:10 PM", title: "Science Lab: Weather & Plants", activities: ["1:25-1:40: Measure sun vs shade plants", "1:40-1:55: Test water absorption", "1:55-2:10: Track weather patterns"] },
      mathBlock: { time: "2:25-3:10 PM", title: "Math Block", activities: ["2:25-2:40: Measure temperatures", "2:40-2:55: Count sunny vs rainy days", "2:55-3:10: Create weather graph"] },
      readingWriting: { time: "3:20-3:45 PM", title: "Reading + Writing", activities: ["3:20-3:30: Word work", "3:30-3:38: Read about weather", "3:38-3:45: Draw and write"] },
      oralReflection: { time: "3:45-4:00 PM", title: "Oral Reflection", activities: ["'How does weather affect plants?'"] }
    }))
  },
  {
    week: 12,
    theme: "Garden Project",
    description: "My Garden Plan",
    learningGoals: ["Science: Review all concepts; design and plan", "Math: Use all skills (measuring, counting, grouping)", "Reading: 5 core words (garden, plant, grow, sun, water)", "Writing: Final summary, labels"],
    coreWords: ["garden", "plant", "grow", "sun", "water"],
    days: Array(5).fill(null).map((_, i) => ({
      day: i + 1, dayName: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"][i],
      literacyHabit: { time: "1:00-1:15 PM", title: "Daily 15-Minute Literacy Habit", activities: ["1:00-1:05: Sound Warm-Up - Review all sounds from 12 weeks", "1:05-1:10: Reread Same Book (final week!)", "1:10-1:15: Gentle Copy"] },
      gardenObservation: { time: "1:15-1:25 PM", title: ["Review Garden Space", "Prepare Soil", "Check New Planting", "Observe Changes", "Final Garden Check"][i], activities: [""] },
      scienceLab: { time: "1:25-2:10 PM", title: "Science Lab: Final Project", activities: ["1:25-1:40: Design garden plan", "1:40-1:55: Plant and measure", "1:55-2:10: Create final display"] },
      mathBlock: { time: "2:25-3:10 PM", title: "Math Block - Review All Skills", activities: ["2:25-2:40: Calculate spacing and totals", "2:40-2:55: Review all math concepts", "2:55-3:10: Final math challenge"] },
      readingWriting: { time: "3:20-3:45 PM", title: "Reading + Writing", activities: ["3:20-3:30: Final word review", "3:30-3:38: Reread favorite passage", "3:38-3:45: Create summary page"] },
      oralReflection: { time: "3:45-4:00 PM", title: ["Oral Reflection", "Oral Reflection", "Oral Reflection", "Oral Reflection", "Final Presentation"][i], activities: ["'What will you grow?'"] }
    }))
  }
];

const ALL_ACHIEVEMENTS: Achievement[] = [
  { id: "first-activity", title: "First Step", description: "Complete your first activity", icon: "🌱", unlocked: false },
  { id: "week-1-complete", title: "Week Warrior", description: "Complete all activities in Week 1", icon: "🏆", unlocked: false },
  { id: "streak-3", title: "On a Roll", description: "Maintain a 3-day learning streak", icon: "🔥", unlocked: false },
  { id: "streak-7", title: "Week Champion", description: "Maintain a 7-day learning streak", icon: "⭐", unlocked: false },
  { id: "scientist", title: "Junior Scientist", description: "Complete 10 science experiments", icon: "🔬", unlocked: false },
  { id: "math-whiz", title: "Math Whiz", description: "Complete 10 math activities", icon: "🔢", unlocked: false },
  { id: "reader", title: "Word Explorer", description: "Learn 20 core words", icon: "📚", unlocked: false },
  { id: "halfway", title: "Halfway Hero", description: "Complete 50% of the curriculum", icon: "🌟", unlocked: false },
  { id: "all-weeks", title: "Garden Master", description: "Complete all 12 weeks", icon: "👑", unlocked: false },
  { id: "perfect-day", title: "Perfect Day", description: "Complete all activities in one day", icon: "💯", unlocked: false }
];

const PLANT_ICONS = ['🌱', '🌿', '🌻', '🌷', '🌼', '🥕', '🍓', '🍅', '🥬', '🌾'];
const WEATHER_ICONS = ['☀️', '🌤️', '☁️', '🌧️', '⛈️', '🌈'];
const MOTIVATIONAL_MESSAGES = [
  "You're growing great! 🌱",
  "Amazing work today! ✨",
  "Keep up the fantastic learning! 🌟",
  "You are a garden superstar! 🌻",
  "Every day is a new adventure! 🌈",
  "Your brain is growing like a plant! 🌿"
];

const ALL_DAYS = [1, 2, 3, 4, 5];

const LESSON_ASSETS: LessonAsset[] = [
  { week: 1, days: ALL_DAYS, block: 'literacyHabit', time: '1:00-1:15 PM', lesson: 'Daily 15-Minute Literacy Habit', label: 'Week 1 Decodable Book', file: 'materials/week-1/week1_decodable_book.html' },
  { week: 1, days: ALL_DAYS, block: 'literacyHabit', time: '1:00-1:15 PM', lesson: 'Daily 15-Minute Literacy Habit', label: 'Daily Journal', file: 'materials/week-1/daily_journal.html' },
  { week: 1, days: [1], block: 'scienceLab', time: '1:25-2:10 PM', lesson: 'Science Lab', label: 'Pot Labels', file: 'materials/week-1/week1_pot_labels.html' },
  { week: 1, days: [1], block: 'scienceLab', time: '1:25-2:10 PM', lesson: 'Science Lab', label: 'Observation Sheet', file: 'materials/week-1/week1_observation_sheet.html' },
  { week: 1, days: [4, 5], block: 'mathBlock', time: '2:25-3:10 PM', lesson: 'Math Block', label: 'Growth Chart', file: 'materials/week-1/week1_growth_chart.html' },
  { week: 1, days: ALL_DAYS, block: 'mathBlock', time: '2:25-3:10 PM', lesson: 'Math Block', label: 'Math Strips', file: 'materials/week-1/math_strips.html' },
  { week: 1, days: ALL_DAYS, block: 'readingWriting', time: '3:20-3:45 PM', lesson: 'Reading + Writing', label: 'Word Cards', file: 'materials/week-1/week1_word_cards.html' },
  { week: 1, days: ALL_DAYS, block: 'readingWriting', time: '3:20-3:45 PM', lesson: 'Reading + Writing', label: 'Reading Strips', file: 'materials/week-1/week1_reading_strips.html' },
  { week: 1, days: [5], block: 'readingWriting', time: '3:20-3:45 PM', lesson: 'Reading + Writing', label: 'Weekly Summary', file: 'materials/week-1/weekly_summary.html' },
  { week: 2, days: ALL_DAYS, block: 'literacyHabit', time: '1:00-1:15 PM', lesson: 'Daily 15-Minute Literacy Habit', label: 'Week 2 Decodable Book', file: 'materials/week-2/week2_decodable_book.html' },
  { week: 2, days: ALL_DAYS, block: 'literacyHabit', time: '1:00-1:15 PM', lesson: 'Daily 15-Minute Literacy Habit', label: 'Daily Journal', file: 'materials/week-2/daily_journal.html' },
  { week: 2, days: ALL_DAYS, block: 'scienceLab', time: '1:25-2:10 PM', lesson: 'Science Lab', label: 'Germination Tracking Sheet', file: 'materials/week-2/week2_germination_sheet.html' },
  { week: 2, days: [2, 3, 4, 5], block: 'mathBlock', time: '2:25-3:10 PM', lesson: 'Math Block', label: 'Day Counter Strip', file: 'materials/week-2/week2_day_counter.html' },
  { week: 2, days: ALL_DAYS, block: 'mathBlock', time: '2:25-3:10 PM', lesson: 'Math Block', label: 'Math Strips', file: 'materials/week-2/math_strips.html' },
  { week: 2, days: ALL_DAYS, block: 'readingWriting', time: '3:20-3:45 PM', lesson: 'Reading + Writing', label: 'Word Cards', file: 'materials/week-2/week2_word_cards.html' },
  { week: 2, days: ALL_DAYS, block: 'readingWriting', time: '3:20-3:45 PM', lesson: 'Reading + Writing', label: 'Reading Strips', file: 'materials/week-2/week2_reading_strips.html' },
  { week: 2, days: [5], block: 'readingWriting', time: '3:20-3:45 PM', lesson: 'Reading + Writing', label: 'Weekly Summary', file: 'materials/week-2/week2_weekly_summary.html' },
  { week: 3, days: ALL_DAYS, block: 'literacyHabit', time: '1:00-1:15 PM', lesson: 'Daily 15-Minute Literacy Habit', label: 'Week 3 Decodable Book', file: 'materials/week-3/week3_decodable_book.html' },
  { week: 3, days: ALL_DAYS, block: 'literacyHabit', time: '1:00-1:15 PM', lesson: 'Daily 15-Minute Literacy Habit', label: 'Daily Journal', file: 'materials/week-3/daily_journal.html' },
  { week: 3, days: [1], block: 'scienceLab', time: '1:25-2:10 PM', lesson: 'Science Lab', label: 'Soil Observation Sheet', file: 'materials/week-3/week3_soil_observation.html' },
  { week: 3, days: [1], block: 'scienceLab', time: '1:25-2:10 PM', lesson: 'Science Lab', label: 'Soil Layers Drawing Sheet', file: 'materials/week-3/week3_soil_layers.html' },
  { week: 3, days: [2, 3, 4, 5], block: 'scienceLab', time: '1:25-2:10 PM', lesson: 'Science Lab', label: 'Compost Tracking Sheet', file: 'materials/week-3/week3_compost_tracker.html' },
  { week: 3, days: [5], block: 'mathBlock', time: '2:25-3:10 PM', lesson: 'Math Block', label: 'Growth Chart', file: 'materials/week-3/week3_growth_chart.html' },
  { week: 3, days: ALL_DAYS, block: 'mathBlock', time: '2:25-3:10 PM', lesson: 'Math Block', label: 'Math Strips', file: 'materials/week-3/math_strips.html' },
  { week: 3, days: ALL_DAYS, block: 'readingWriting', time: '3:20-3:45 PM', lesson: 'Reading + Writing', label: 'Word Cards', file: 'materials/week-3/week3_word_cards.html' },
  { week: 3, days: ALL_DAYS, block: 'readingWriting', time: '3:20-3:45 PM', lesson: 'Reading + Writing', label: 'Reading Strips', file: 'materials/week-3/week3_reading_strips.html' },
  { week: 3, days: [5], block: 'readingWriting', time: '3:20-3:45 PM', lesson: 'Reading + Writing', label: 'Weekly Summary', file: 'materials/week-3/week3_weekly_summary.html' },
  { week: 4, days: ALL_DAYS, block: 'literacyHabit', time: '1:00-1:15 PM', lesson: 'Daily 15-Minute Literacy Habit', label: 'Week 4 Decodable Book', file: 'materials/week-4/week4_decodable_book.html' },
  { week: 4, days: ALL_DAYS, block: 'literacyHabit', time: '1:00-1:15 PM', lesson: 'Daily 15-Minute Literacy Habit', label: 'Daily Journal', file: 'materials/week-4/daily_journal.html' },
  { week: 4, days: [1], block: 'scienceLab', time: '1:25-2:10 PM', lesson: 'Science Lab', label: 'Leaf Collection Sheet', file: 'materials/week-4/week4_leaf_collection.html' },
  { week: 4, days: [2, 3, 4, 5], block: 'scienceLab', time: '1:25-2:10 PM', lesson: 'Science Lab', label: 'Sun vs Shade Tracker', file: 'materials/week-4/week4_sun_shade_tracker.html' },
  { week: 4, days: [3], block: 'scienceLab', time: '1:25-2:10 PM', lesson: 'Science Lab', label: 'Leaf Vein Drawing Sheet', file: 'materials/week-4/week4_leaf_veins.html' },
  { week: 4, days: [4], block: 'scienceLab', time: '1:25-2:10 PM', lesson: 'Science Lab', label: 'Comparison Chart', file: 'materials/week-4/week4_comparison_chart.html' },
  { week: 4, days: [5], block: 'mathBlock', time: '2:25-3:10 PM', lesson: 'Math Block', label: 'Growth Graph', file: 'materials/week-4/week4_growth_graph.html' },
  { week: 4, days: ALL_DAYS, block: 'mathBlock', time: '2:25-3:10 PM', lesson: 'Math Block', label: 'Math Strips', file: 'materials/week-4/math_strips.html' },
  { week: 4, days: ALL_DAYS, block: 'readingWriting', time: '3:20-3:45 PM', lesson: 'Reading + Writing', label: 'Word Cards', file: 'materials/week-4/week4_word_cards.html' },
  { week: 4, days: ALL_DAYS, block: 'readingWriting', time: '3:20-3:45 PM', lesson: 'Reading + Writing', label: 'Reading Strips', file: 'materials/week-4/week4_reading_strips.html' },
  { week: 4, days: [5], block: 'readingWriting', time: '3:20-3:45 PM', lesson: 'Reading + Writing', label: 'Weekly Summary', file: 'materials/week-4/week4_weekly_summary.html' },
  { week: 5, days: ALL_DAYS, block: 'literacyHabit', time: '1:00-1:15 PM', lesson: 'Daily 15-Minute Literacy Habit', label: 'Week 5 Decodable Book', file: 'materials/week-5/week5_decodable_book.html' },
  { week: 5, days: ALL_DAYS, block: 'literacyHabit', time: '1:00-1:15 PM', lesson: 'Daily 15-Minute Literacy Habit', label: 'Daily Journal', file: 'materials/week-5/daily_journal.html' },
  { week: 5, days: [1, 2], block: 'scienceLab', time: '1:25-2:10 PM', lesson: 'Science Lab', label: 'Drip Counting Sheet', file: 'materials/week-5/week5_drip_counting.html' },
  { week: 5, days: [3], block: 'scienceLab', time: '1:25-2:10 PM', lesson: 'Science Lab', label: 'Water Level Tracking Sheet', file: 'materials/week-5/week5_water_level.html' },
  { week: 5, days: [4, 5], block: 'scienceLab', time: '1:25-2:10 PM', lesson: 'Science Lab', label: 'Drip Comparison Chart', file: 'materials/week-5/week5_drip_comparison.html' },
  { week: 5, days: ALL_DAYS, block: 'mathBlock', time: '2:25-3:10 PM', lesson: 'Math Block', label: 'Math Strips', file: 'materials/week-5/math_strips.html' },
  { week: 5, days: ALL_DAYS, block: 'readingWriting', time: '3:20-3:45 PM', lesson: 'Reading + Writing', label: 'Word Cards', file: 'materials/week-5/week5_word_cards.html' },
  { week: 5, days: ALL_DAYS, block: 'readingWriting', time: '3:20-3:45 PM', lesson: 'Reading + Writing', label: 'Reading Strips', file: 'materials/week-5/week5_reading_strips.html' },
  { week: 5, days: [5], block: 'readingWriting', time: '3:20-3:45 PM', lesson: 'Reading + Writing', label: 'Weekly Summary', file: 'materials/week-5/week5_weekly_summary.html' },
  { week: 6, days: ALL_DAYS, block: 'literacyHabit', time: '1:00-1:15 PM', lesson: 'Daily 15-Minute Literacy Habit', label: 'Week 6 Decodable Book', file: 'materials/week-6/week6_decodable_book.html' },
  { week: 6, days: ALL_DAYS, block: 'literacyHabit', time: '1:00-1:15 PM', lesson: 'Daily 15-Minute Literacy Habit', label: 'Daily Journal', file: 'materials/week-6/daily_journal.html' },
  { week: 6, days: ALL_DAYS, block: 'scienceLab', time: '1:25-2:10 PM', lesson: 'Science Lab', label: 'Height Tracker', file: 'materials/week-6/week6_height_tracker.html' },
  { week: 6, days: [2, 3, 4, 5], block: 'mathBlock', time: '2:25-3:10 PM', lesson: 'Math Block', label: 'Leaf Count Chart', file: 'materials/week-6/week6_leaf_count.html' },
  { week: 6, days: [5], block: 'mathBlock', time: '2:25-3:10 PM', lesson: 'Math Block', label: 'Growth Graph', file: 'materials/week-6/week6_growth_graph.html' },
  { week: 6, days: ALL_DAYS, block: 'mathBlock', time: '2:25-3:10 PM', lesson: 'Math Block', label: 'Math Strips', file: 'materials/week-6/math_strips.html' },
  { week: 6, days: ALL_DAYS, block: 'readingWriting', time: '3:20-3:45 PM', lesson: 'Reading + Writing', label: 'Word Cards', file: 'materials/week-6/week6_word_cards.html' },
  { week: 6, days: ALL_DAYS, block: 'readingWriting', time: '3:20-3:45 PM', lesson: 'Reading + Writing', label: 'Reading Strips', file: 'materials/week-6/week6_reading_strips.html' },
  { week: 6, days: [5], block: 'readingWriting', time: '3:20-3:45 PM', lesson: 'Reading + Writing', label: 'Weekly Summary', file: 'materials/week-6/week6_weekly_summary.html' },
  { week: 7, days: ALL_DAYS, block: 'literacyHabit', time: '1:00-1:15 PM', lesson: 'Daily 15-Minute Literacy Habit', label: 'Week 7 Decodable Book', file: 'materials/week-7/week7_decodable_book.html' },
  { week: 7, days: ALL_DAYS, block: 'literacyHabit', time: '1:00-1:15 PM', lesson: 'Daily 15-Minute Literacy Habit', label: 'Daily Journal', file: 'materials/week-7/daily_journal.html' },
  { week: 7, days: ALL_DAYS, block: 'scienceLab', time: '1:25-2:10 PM', lesson: 'Science Lab', label: 'Grid Paper', file: 'materials/week-7/week7_grid_paper.html' },
  { week: 7, days: [1, 2, 3, 4], block: 'mathBlock', time: '2:25-3:10 PM', lesson: 'Math Block', label: 'Row Counting Sheet', file: 'materials/week-7/week7_row_counting.html' },
  { week: 7, days: ALL_DAYS, block: 'mathBlock', time: '2:25-3:10 PM', lesson: 'Math Block', label: 'Math Strips', file: 'materials/week-7/math_strips.html' },
  { week: 7, days: ALL_DAYS, block: 'readingWriting', time: '3:20-3:45 PM', lesson: 'Reading + Writing', label: 'Word Cards', file: 'materials/week-7/week7_word_cards.html' },
  { week: 7, days: ALL_DAYS, block: 'readingWriting', time: '3:20-3:45 PM', lesson: 'Reading + Writing', label: 'Reading Strips', file: 'materials/week-7/week7_reading_strips.html' },
  { week: 7, days: [5], block: 'readingWriting', time: '3:20-3:45 PM', lesson: 'Reading + Writing', label: 'Weekly Summary', file: 'materials/week-7/week7_weekly_summary.html' },
  { week: 8, days: ALL_DAYS, block: 'literacyHabit', time: '1:00-1:15 PM', lesson: 'Daily 15-Minute Literacy Habit', label: 'Week 8 Decodable Book', file: 'materials/week-8/week8_decodable_book.html' },
  { week: 8, days: ALL_DAYS, block: 'literacyHabit', time: '1:00-1:15 PM', lesson: 'Daily 15-Minute Literacy Habit', label: 'Daily Journal', file: 'materials/week-8/daily_journal.html' },
  { week: 8, days: [1, 2, 3, 4], block: 'scienceLab', time: '1:25-2:10 PM', lesson: 'Science Lab', label: 'Bug Tally Sheet', file: 'materials/week-8/week8_bug_tally.html' },
  { week: 8, days: [2], block: 'scienceLab', time: '1:25-2:10 PM', lesson: 'Science Lab', label: 'Leaf Damage Survey', file: 'materials/week-8/week8_leaf_survey.html' },
  { week: 8, days: [5], block: 'mathBlock', time: '2:25-3:10 PM', lesson: 'Math Block', label: 'Bug Graph', file: 'materials/week-8/week8_bug_graph.html' },
  { week: 8, days: ALL_DAYS, block: 'mathBlock', time: '2:25-3:10 PM', lesson: 'Math Block', label: 'Math Strips', file: 'materials/week-8/math_strips.html' },
  { week: 8, days: ALL_DAYS, block: 'readingWriting', time: '3:20-3:45 PM', lesson: 'Reading + Writing', label: 'Word Cards', file: 'materials/week-8/week8_word_cards.html' },
  { week: 8, days: ALL_DAYS, block: 'readingWriting', time: '3:20-3:45 PM', lesson: 'Reading + Writing', label: 'Reading Strips', file: 'materials/week-8/week8_reading_strips.html' },
  { week: 8, days: [5], block: 'readingWriting', time: '3:20-3:45 PM', lesson: 'Reading + Writing', label: 'Weekly Summary', file: 'materials/week-8/week8_weekly_summary.html' },
  { week: 9, days: ALL_DAYS, block: 'literacyHabit', time: '1:00-1:15 PM', lesson: 'Daily 15-Minute Literacy Habit', label: 'Week 9 Decodable Book', file: 'materials/week-9/week9_decodable_book.html' },
  { week: 9, days: ALL_DAYS, block: 'literacyHabit', time: '1:00-1:15 PM', lesson: 'Daily 15-Minute Literacy Habit', label: 'Daily Journal', file: 'materials/week-9/daily_journal.html' },
  { week: 9, days: [1, 2, 3], block: 'mathBlock', time: '2:25-3:10 PM', lesson: 'Math Block', label: 'Grouping Mat', file: 'materials/week-9/week9_grouping_mat.html' },
  { week: 9, days: [1, 2, 3, 4], block: 'mathBlock', time: '2:25-3:10 PM', lesson: 'Math Block', label: 'Seed Counting Sheet', file: 'materials/week-9/week9_seed_counting.html' },
  { week: 9, days: [5], block: 'readingWriting', time: '3:20-3:45 PM', lesson: 'Reading + Writing', label: 'Seed Packet Labels', file: 'materials/week-9/week9_seed_labels.html' },
  { week: 9, days: ALL_DAYS, block: 'mathBlock', time: '2:25-3:10 PM', lesson: 'Math Block', label: 'Math Strips', file: 'materials/week-9/math_strips.html' },
  { week: 9, days: ALL_DAYS, block: 'readingWriting', time: '3:20-3:45 PM', lesson: 'Reading + Writing', label: 'Word Cards', file: 'materials/week-9/week9_word_cards.html' },
  { week: 9, days: ALL_DAYS, block: 'readingWriting', time: '3:20-3:45 PM', lesson: 'Reading + Writing', label: 'Reading Strips', file: 'materials/week-9/week9_reading_strips.html' },
  { week: 9, days: [5], block: 'readingWriting', time: '3:20-3:45 PM', lesson: 'Reading + Writing', label: 'Weekly Summary', file: 'materials/week-9/week9_weekly_summary.html' },
  { week: 10, days: ALL_DAYS, block: 'literacyHabit', time: '1:00-1:15 PM', lesson: 'Daily 15-Minute Literacy Habit', label: 'Week 10 Decodable Book', file: 'materials/week-10/week10_decodable_book.html' },
  { week: 10, days: ALL_DAYS, block: 'literacyHabit', time: '1:00-1:15 PM', lesson: 'Daily 15-Minute Literacy Habit', label: 'Daily Journal', file: 'materials/week-10/daily_journal.html' },
  { week: 10, days: ALL_DAYS, block: 'mathBlock', time: '2:25-3:10 PM', lesson: 'Math Block', label: 'Sharing Mat', file: 'materials/week-10/week10_sharing_mat.html' },
  { week: 10, days: [2, 3, 4, 5], block: 'mathBlock', time: '2:25-3:10 PM', lesson: 'Math Block', label: 'Equal Sharing Recording Sheet', file: 'materials/week-10/week10_sharing_sheet.html' },
  { week: 10, days: ALL_DAYS, block: 'mathBlock', time: '2:25-3:10 PM', lesson: 'Math Block', label: 'Math Strips', file: 'materials/week-10/math_strips.html' },
  { week: 10, days: ALL_DAYS, block: 'readingWriting', time: '3:20-3:45 PM', lesson: 'Reading + Writing', label: 'Word Cards', file: 'materials/week-10/week10_word_cards.html' },
  { week: 10, days: ALL_DAYS, block: 'readingWriting', time: '3:20-3:45 PM', lesson: 'Reading + Writing', label: 'Reading Strips', file: 'materials/week-10/week10_reading_strips.html' },
  { week: 10, days: [5], block: 'readingWriting', time: '3:20-3:45 PM', lesson: 'Reading + Writing', label: 'Weekly Summary', file: 'materials/week-10/week10_weekly_summary.html' },
  { week: 11, days: ALL_DAYS, block: 'literacyHabit', time: '1:00-1:15 PM', lesson: 'Daily 15-Minute Literacy Habit', label: 'Week 11 Decodable Book', file: 'materials/week-11/week11_decodable_book.html' },
  { week: 11, days: ALL_DAYS, block: 'literacyHabit', time: '1:00-1:15 PM', lesson: 'Daily 15-Minute Literacy Habit', label: 'Daily Journal', file: 'materials/week-11/daily_journal.html' },
  { week: 11, days: ALL_DAYS, block: 'gardenObservation', time: '1:15-1:25 PM', lesson: 'Garden Observation', label: 'Daily Weather Chart', file: 'materials/week-11/week11_weather_chart.html' },
  { week: 11, days: [4, 5], block: 'mathBlock', time: '2:25-3:10 PM', lesson: 'Math Block', label: 'Weather Bar Graph', file: 'materials/week-11/week11_weather_graph.html' },
  { week: 11, days: [5], block: 'scienceLab', time: '1:25-2:10 PM', lesson: 'Science Lab', label: 'Weather + Growth Comparison', file: 'materials/week-11/week11_growth_compare.html' },
  { week: 11, days: ALL_DAYS, block: 'mathBlock', time: '2:25-3:10 PM', lesson: 'Math Block', label: 'Math Strips', file: 'materials/week-11/math_strips.html' },
  { week: 11, days: ALL_DAYS, block: 'readingWriting', time: '3:20-3:45 PM', lesson: 'Reading + Writing', label: 'Word Cards', file: 'materials/week-11/week11_word_cards.html' },
  { week: 11, days: ALL_DAYS, block: 'readingWriting', time: '3:20-3:45 PM', lesson: 'Reading + Writing', label: 'Reading Strips', file: 'materials/week-11/week11_reading_strips.html' },
  { week: 11, days: [5], block: 'readingWriting', time: '3:20-3:45 PM', lesson: 'Reading + Writing', label: 'Weekly Summary', file: 'materials/week-11/week11_weekly_summary.html' },
  { week: 12, days: ALL_DAYS, block: 'literacyHabit', time: '1:00-1:15 PM', lesson: 'Daily 15-Minute Literacy Habit', label: 'Week 12 Decodable Book', file: 'materials/week-12/week12_decodable_book.html' },
  { week: 12, days: ALL_DAYS, block: 'literacyHabit', time: '1:00-1:15 PM', lesson: 'Daily 15-Minute Literacy Habit', label: 'Daily Journal', file: 'materials/week-12/daily_journal.html' },
  { week: 12, days: [1, 2], block: 'scienceLab', time: '1:25-2:10 PM', lesson: 'Science Lab', label: 'Garden Design Template', file: 'materials/week-12/week12_garden_design.html' },
  { week: 12, days: [3], block: 'scienceLab', time: '1:25-2:10 PM', lesson: 'Science Lab', label: 'Watering Calendar', file: 'materials/week-12/week12_watering_calendar.html' },
  { week: 12, days: [4], block: 'scienceLab', time: '1:25-2:10 PM', lesson: 'Science Lab', label: 'Final Measurement Sheet', file: 'materials/week-12/week12_final_measurements.html' },
  { week: 12, days: [5], block: 'readingWriting', time: '3:20-3:45 PM', lesson: 'Reading + Writing', label: 'What I Learned Summary', file: 'materials/week-12/week12_what_i_learned.html' },
  { week: 12, days: [5], block: 'oralReflection', time: '3:45-4:00 PM', lesson: 'Oral Reflection / Presentation', label: 'Final Presentation Display', file: 'materials/week-12/week12_poster_kit.html' },
  { week: 12, days: ALL_DAYS, block: 'mathBlock', time: '2:25-3:10 PM', lesson: 'Math Block', label: 'Math Strips', file: 'materials/week-12/math_strips.html' },
  { week: 12, days: ALL_DAYS, block: 'readingWriting', time: '3:20-3:45 PM', lesson: 'Reading + Writing', label: 'Word Cards', file: 'materials/week-12/week12_word_cards.html' },
  { week: 12, days: ALL_DAYS, block: 'readingWriting', time: '3:20-3:45 PM', lesson: 'Reading + Writing', label: 'Reading Strips', file: 'materials/week-12/week12_reading_strips.html' }
];

const BLOCK_ID_TO_KEY: Record<string, BlockKey> = {
  literacy: 'literacyHabit',
  observation: 'gardenObservation',
  science: 'scienceLab',
  math: 'mathBlock',
  reading: 'readingWriting',
  reflection: 'oralReflection'
};

function SproutMascot({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 21c-0.9 0-1.5-0.6-1.5-1.5V12c0-0.9 0.6-1.5 1.5-1.5s1.5 0.6 1.5 1.5v7.5c0 0.9-0.6 1.5-1.5 1.5z" fill="currentColor" />
      <path d="M11.9 11.2C8.5 11.2 5.7 8.4 5.7 5c3.4 0 6.2 2.8 6.2 6.2z" fill="currentColor" />
      <path d="M12.1 11.2c3.4 0 6.2-2.8 6.2-6.2-3.4 0-6.2 2.8-6.2 6.2z" fill="currentColor" />
    </svg>
  );
}

function App() {
  const [view, setView] = useState<'overview' | 'week' | 'day' | 'stats'>('overview');
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedDay, setSelectedDay] = useState(1);
  const [progress, setProgress] = useState<ProgressData>({
    completedActivities: [],
    currentWeek: 1,
    currentDay: 1,
    notes: [],
    streak: 0,
    lastActiveDate: '',
    achievements: []
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [showMaterials, setShowMaterials] = useState(false);
  const [celebration, setCelebration] = useState<string | null>(null);
  const [showAchievement, setShowAchievement] = useState<Achievement | null>(null);
  const [currentWeather] = useState(() => WEATHER_ICONS[Math.floor(Math.random() * WEATHER_ICONS.length)]);
  const [plantIcon] = useState(() => PLANT_ICONS[Math.floor(Math.random() * PLANT_ICONS.length)]);
  const [motivationalMessage, setMotivationalMessage] = useState(() => MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)]);
  const [mounted, setMounted] = useState(false);
  const [assetModal, setAssetModal] = useState<LessonAsset | null>(null);
  const [textAssetContent, setTextAssetContent] = useState('');
  const [textAssetError, setTextAssetError] = useState<string | null>(null);
  const [textAssetLoading, setTextAssetLoading] = useState(false);

  useEffect(() => {
    loadProgress();
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isLoaded && progress.lastActiveDate) {
      const today = new Date().toDateString();
      const lastActive = progress.lastActiveDate;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (today !== lastActive) {
        const yesterdayStr = yesterday.toDateString();
        if (lastActive !== yesterdayStr && progress.streak > 0) {
          updateStreak(0);
        }
      }
    }
  }, [isLoaded]);

  useEffect(() => {
    if (!assetModal) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setAssetModal(null);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [assetModal]);

  const loadProgress = async () => {
    try {
      const saved = await persistence.getItem('gardenProgress');
      if (saved) {
        setProgress(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load progress', e);
    }
    setIsLoaded(true);
  };

  const saveProgress = async (newProgress: ProgressData) => {
    setProgress(newProgress);
    await persistence.setItem('gardenProgress', JSON.stringify(newProgress));
  };

  const updateStreak = async (newStreak: number) => {
    const today = new Date().toDateString();
    await saveProgress({ ...progress, streak: newStreak, lastActiveDate: today });
  };

  const checkAchievements = useCallback(async (newCompleted: string[]) => {
    const newAchievements: string[] = [...progress.achievements];
    const currentAchievements = new Set(progress.achievements);

    if (newCompleted.length > 0 && !currentAchievements.has('first-activity')) {
      newAchievements.push('first-activity');
      triggerAchievement('first-activity');
    }

    const week1Activities = Array.from({ length: 30 }, (_, i) => `week1-day${Math.floor(i / 6) + 1}-${['literacy', 'observation', 'science', 'math', 'reading', 'reflection'][i % 6]}`);
    if (week1Activities.every(a => newCompleted.includes(a)) && !currentAchievements.has('week-1-complete')) {
      newAchievements.push('week-1-complete');
      triggerAchievement('week-1-complete');
    }

    if (progress.streak >= 3 && !currentAchievements.has('streak-3')) {
      newAchievements.push('streak-3');
      triggerAchievement('streak-3');
    }

    if (progress.streak >= 7 && !currentAchievements.has('streak-7')) {
      newAchievements.push('streak-7');
      triggerAchievement('streak-7');
    }

    const totalActivities = CURRICULUM.reduce((sum, week) => sum + week.days.length * 6, 0);
    if (newCompleted.length >= totalActivities * 0.5 && !currentAchievements.has('halfway')) {
      newAchievements.push('halfway');
      triggerAchievement('halfway');
    }

    if (newCompleted.length >= totalActivities && !currentAchievements.has('all-weeks')) {
      newAchievements.push('all-weeks');
      triggerAchievement('all-weeks');
    }

    if (newAchievements.length > progress.achievements.length) {
      await saveProgress({ ...progress, achievements: newAchievements });
    }
  }, [progress]);

  const triggerAchievement = (achievementId: string) => {
    const achievement = ALL_ACHIEVEMENTS.find(a => a.id === achievementId);
    if (achievement) {
      setShowAchievement({ ...achievement, unlocked: true, unlockedAt: new Date().toISOString() });
      setTimeout(() => setShowAchievement(null), 3000);
    }
  };

  const toggleActivity = async (activityId: string) => {
    const wasCompleted = progress.completedActivities.includes(activityId);
    const today = new Date().toDateString();
    
    let newStreak = progress.streak;
    if (!wasCompleted) {
      if (progress.lastActiveDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (progress.lastActiveDate === yesterday.toDateString()) {
          newStreak = progress.streak + 1;
        } else {
          newStreak = 1;
        }
      }
      triggerCelebration();
    }

    const newCompleted = wasCompleted
      ? progress.completedActivities.filter(id => id !== activityId)
      : [...progress.completedActivities, activityId];
    
    await saveProgress({ 
      ...progress, 
      completedActivities: newCompleted, 
      streak: newStreak,
      lastActiveDate: today 
    });
    
    checkAchievements(newCompleted);
    setMotivationalMessage(MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)]);
  };

  const triggerCelebration = () => {
    const emojis = ['🌟', '✨', '🎉', '💚', '🌱', '🌻', '🪴', '🌿'];
    setCelebration(emojis[Math.floor(Math.random() * emojis.length)]);
    setTimeout(() => setCelebration(null), 1200);
  };

  const getActivityId = (week: number, day: number, block: string) => 
    `week${week}-day${day}-${block}`;

  const getWeekAccent = (week: number) => {
    switch (week) {
      case 1:
        return 'var(--accent-sky)';
      case 2:
      case 3:
        return 'var(--accent-earth)';
      case 4:
        return 'var(--accent-sun)';
      case 5:
        return 'var(--accent-sky)';
      case 6:
        return 'var(--accent-leaf)';
      case 7:
        return 'var(--accent-leaf)';
      case 8:
        return 'var(--accent-coral)';
      case 9:
        return 'var(--accent-earth)';
      case 10:
        return 'var(--accent-sun)';
      case 11:
        return 'var(--accent-sky)';
      case 12:
        return 'var(--accent-leaf)';
      default:
        return 'var(--primary)';
    }
  };

  const isActivityCompleted = (activityId: string) => 
    progress.completedActivities.includes(activityId);

  const getWeekProgress = (week: number) => {
    const weekData = CURRICULUM[week - 1];
    const weekActivities = weekData.days.flatMap((day, dayIdx) => [
      getActivityId(week, dayIdx + 1, 'literacy'),
      getActivityId(week, dayIdx + 1, 'observation'),
      getActivityId(week, dayIdx + 1, 'science'),
      getActivityId(week, dayIdx + 1, 'math'),
      getActivityId(week, dayIdx + 1, 'reading'),
      getActivityId(week, dayIdx + 1, 'reflection')
    ]);
    const completed = weekActivities.filter(a => progress.completedActivities.includes(a)).length;
    return Math.round((completed / weekActivities.length) * 100);
  };

  const totalActivities = CURRICULUM.reduce((sum, week) => sum + week.days.length * 6, 0);
  const totalProgress = Math.round((progress.completedActivities.length / totalActivities) * 100);

  const currentWeekData = CURRICULUM[selectedWeek - 1];
  const currentDayData = currentWeekData.days[selectedDay - 1];

  const getAssetsForBlock = useCallback((week: number, day: number, blockId: string) => {
    const blockKey = BLOCK_ID_TO_KEY[blockId];
    if (!blockKey) {
      return [];
    }
    return LESSON_ASSETS.filter(asset =>
      asset.week === week &&
      asset.block === blockKey &&
      asset.days.includes(day)
    );
  }, []);

  const toAssetUrl = useCallback((file: string) => `/${file.replace(/\\/g, '/')}`, []);

  const getAssetType = useCallback((file: string) => {
    const normalized = file.toLowerCase();
    if (normalized.endsWith('.html') || normalized.endsWith('.htm')) return 'html';
    if (normalized.endsWith('.pdf')) return 'pdf';
    if (/\.(png|jpg|jpeg|gif|webp|svg|bmp)$/i.test(normalized)) return 'image';
    if (/\.(txt|md|json|csv)$/i.test(normalized)) return 'text';
    return 'other';
  }, []);

  const activeAssetType = assetModal ? getAssetType(assetModal.file) : null;
  const activeAssetUrl = assetModal ? toAssetUrl(assetModal.file) : '';

  useEffect(() => {
    if (!assetModal || activeAssetType !== 'text') {
      setTextAssetContent('');
      setTextAssetError(null);
      setTextAssetLoading(false);
      return;
    }

    let isCancelled = false;
    setTextAssetLoading(true);
    setTextAssetError(null);

    fetch(activeAssetUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load asset (${response.status})`);
        }
        return response.text();
      })
      .then(text => {
        if (!isCancelled) {
          setTextAssetContent(text);
        }
      })
      .catch(error => {
        if (!isCancelled) {
          setTextAssetError(error instanceof Error ? error.message : 'Unable to load asset');
          setTextAssetContent('');
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setTextAssetLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [assetModal, activeAssetType, activeAssetUrl]);

  const achievements = useMemo(() => 
    ALL_ACHIEVEMENTS.map(a => ({
      ...a,
      unlocked: progress.achievements.includes(a.id)
    })), [progress.achievements]);

  const materials: Record<number, string[]> = {
    1: ["3 similar small plants/pots", "Ruler", "Cubes/counters (20+)", "Coloring pencils", "Pencil", "Decodable book", "Word cards: sun, water, plant, soil, grow"],
    2: ["2 clear cups", "Bean seeds", "Potting soil", "Garden trowel", "Ruler", "Cubes", "Decodable book"],
    3: ["2 shallow trays", "Extra potting soil", "Compost container", "Vegetable scraps", "Calendar", "Ruler", "Cubes"],
    4: ["Magnifying glass", "Flashlight", "2 similar potted plants", "Tape", "Ruler", "Cubes"],
    5: ["Plastic bottles with caps", "Thumbtack/pin", "Marker", "Ruler", "Cubes"],
    6: ["Craft sticks (5+)", "Building blocks", "Ruler", "Cubes", "Coloring pencils"],
    7: ["Stones/pebbles (20+)", "Small pots (optional)", "Ruler", "Grid paper"],
    8: ["Magnifying glass", "Ruler", "Cubes", "Coloring pencils"],
    9: ["Seeds", "Small envelopes/bags", "Tape/glue", "Cubes"],
    10: ["Harvest from garden", "Safe cutting tool", "Plates/bowls", "Cubes"],
    11: ["Ruler", "Cubes", "Coloring pencils", "Weather chart"],
    12: ["Calendar", "Poster board", "Tape/glue", "Seeds/seedlings", "All previous materials"]
  };

  if (!isLoaded) {
    return (
      <div className="loading-screen">
        <div className="loading-plant">
          <div className="plant-grow-animation">
            <span className="seed">🌱</span>
          </div>
        </div>
        <p>Planting your garden...</p>
      </div>
    );
  }

  return (
    <div className={`app ${mounted ? 'mounted' : ''}`}>
      {/* Background visuals handled by CSS gradient + subtle texture */}
      {/* Celebration Popup */}
      {celebration && (
        <div className="celebration-popup">
          <div className="celebration-content">
            <span className="celebration-emoji">{celebration}</span>
          </div>
        </div>
      )}
      
      {/* Achievement Popup */}
      {showAchievement && (
        <div className="achievement-popup">
          <div className="achievement-content">
            <div className="achievement-icon">{showAchievement.icon}</div>
            <div className="achievement-text">
              <span className="achievement-label">Achievement Unlocked!</span>
              <h3>{showAchievement.title}</h3>
              <p>{showAchievement.description}</p>
            </div>
          </div>
        </div>
      )}

      {assetModal && (
        <div className="asset-modal-overlay" onClick={() => setAssetModal(null)}>
          <div className="asset-modal" onClick={(event) => event.stopPropagation()}>
            <div className="asset-modal-header">
              <div>
                <h3>{assetModal.label}</h3>
                <p>
                  Week {assetModal.week} • {assetModal.time} • {assetModal.lesson}
                </p>
              </div>
              <button className="asset-modal-close" onClick={() => setAssetModal(null)}>
                Close
              </button>
            </div>
            <div className="asset-modal-body">
              {(activeAssetType === 'html' || activeAssetType === 'pdf') && (
                <iframe
                  title={assetModal.label}
                  src={activeAssetUrl}
                  className="asset-modal-frame"
                />
              )}
              {activeAssetType === 'image' && (
                <img className="asset-modal-image" src={activeAssetUrl} alt={assetModal.label} />
              )}
              {activeAssetType === 'text' && (
                <div className="asset-modal-text">
                  {textAssetLoading && <p>Loading asset...</p>}
                  {textAssetError && <p>{textAssetError}</p>}
                  {!textAssetLoading && !textAssetError && <pre>{textAssetContent}</pre>}
                </div>
              )}
              {activeAssetType === 'other' && (
                <p className="asset-modal-fallback">
                  Preview is not available for this file type.
                </p>
              )}
            </div>
            <div className="asset-modal-footer">
              <a href={activeAssetUrl} target="_blank" rel="noreferrer">
                Open in new tab
              </a>
            </div>
          </div>
        </div>
      )}
       
      <div className="container">
        <header className="header">
          <div className="logo" onClick={() => { setView('overview'); setShowMaterials(false); }}>
            <div className="logo-icon">
              <span className="plant-emoji">{plantIcon}</span>
            </div>
            <div className="logo-text">
              <h1>Garden Friends</h1>
              <span className="tagline">Growing & Learning!</span>
            </div>
          </div>
          
          <div className="header-right">
            <div className="stats-toggle" onClick={() => setView(view === 'stats' ? 'overview' : 'stats')}>
              <span className="stats-icon">📊</span>
            </div>
            <div className="streak-badge" title="Learning Streak">
              <span className="fire-icon">🔥</span>
              <span className="streak-count">{progress.streak}</span>
            </div>
            <div className="weather-badge">
              <span className="weather-icon">{currentWeather}</span>
            </div>
            <div className="progress-ring">
              <svg viewBox="0 0 36 36" className="circular-chart">
                <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="circle" strokeDasharray={`${totalProgress}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <span className="progress-text">{totalProgress}%</span>
            </div>
          </div>
        </header>

        {/* Stats View */}
        {view === 'stats' && (
          <div className="stats-view">
            <button className="back-btn" onClick={() => setView('overview')}>
              ← Back to Garden
            </button>
            
            <div className="stats-header">
              <h2>📊 Your Learning Journey</h2>
              <p>{motivationalMessage}</p>
            </div>

            <div className="stats-grid">
              <div className="stat-card total">
                <div className="stat-icon">✅</div>
                <div className="stat-info">
                  <span className="stat-value">{progress.completedActivities.length}</span>
                  <span className="stat-label">Activities Completed</span>
                </div>
                <div className="stat-bar">
                  <div className="stat-fill" style={{width: `${totalProgress}%`}}></div>
                </div>
              </div>

              <div className="stat-card streak">
                <div className="stat-icon">🔥</div>
                <div className="stat-info">
                  <span className="stat-value">{progress.streak}</span>
                  <span className="stat-label">Day Streak</span>
                </div>
                <div className="streak-flames">
                  {Array.from({length: Math.min(progress.streak, 7)}).map((_, i) => (
                    <span key={i} className="flame" style={{animationDelay: `${i * 0.1}s`}}>🔥</span>
                  ))}
                </div>
              </div>

              <div className="stat-card weeks">
                <div className="stat-icon">📅</div>
                <div className="stat-info">
                  <span className="stat-value">{CURRICULUM.filter((_, i) => getWeekProgress(i + 1) === 100).length}</span>
                  <span className="stat-label">Weeks Completed</span>
                </div>
                <div className="weeks-dots">
                  {CURRICULUM.map((week) => (
                    <span 
                      key={week.week} 
                      className={`week-dot ${getWeekProgress(week.week) === 100 ? 'complete' : getWeekProgress(week.week) > 0 ? 'progress' : ''}`}
                    >
                      {week.week}
                    </span>
                  ))}
                </div>
              </div>

              <div className="stat-card achievements">
                <div className="stat-icon">🏅</div>
                <div className="stat-info">
                  <span className="stat-value">{achievements.filter(a => a.unlocked).length}</span>
                  <span className="stat-label">Achievements</span>
                </div>
              </div>
            </div>

            <div className="achievements-section">
              <h3>🏆 Achievements</h3>
              <div className="achievements-grid">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}>
                    <div className="achievement-emoji">{achievement.icon}</div>
                    <div className="achievement-info">
                      <h4>{achievement.title}</h4>
                      <p>{achievement.description}</p>
                    </div>
                    {achievement.unlocked && <span className="check">✓</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="progress-chart">
              <h3>📈 Weekly Progress</h3>
              <div className="chart-bars">
                {CURRICULUM.slice(0, 6).map((week) => (
                  <div key={week.week} className="chart-bar-container">
                    <div 
                      className="chart-bar" 
                      style={{height: `${getWeekProgress(week.week)}%`}}
                    >
                      <span className="bar-value">{getWeekProgress(week.week)}%</span>
                    </div>
                    <span className="bar-label">W{week.week}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {view === 'overview' && !showMaterials && (
          <>
            <div className="welcome-banner">
              <div className="welcome-content">
                <h2>
                  Welcome to Your Garden!
                  <SproutMascot className="sprout-mascot sprout-mascot-title" />
                </h2>
                <p>{motivationalMessage}</p>
              </div>
              <div className="banner-actions">
                <button className="materials-btn" onClick={() => setShowMaterials(true)}>
                  📦 My Supplies
                </button>
              </div>
            </div>

            <div className="weeks-grid">
              {CURRICULUM.map((week, idx) => (
                <div
                  key={week.week}
                  className={`week-card ${progress.currentWeek === week.week ? 'current' : ''} ${getWeekProgress(week.week) === 100 ? 'completed' : ''}`}
                  onClick={() => { setSelectedWeek(week.week); setView('week'); }}
                  style={{animationDelay: `${idx * 0.05}s`, '--week-accent': getWeekAccent(week.week)} as React.CSSProperties}
                >
                  <div className="week-card-header">
                    <span className="week-number">
                      {week.week === 1 && <SproutMascot className="sprout-mascot sprout-mascot-badge" />}
                      Week {week.week}
                    </span>
                    {getWeekProgress(week.week) === 100 && <span className="star-badge">⭐</span>}
                  </div>
                  <h3 className="week-theme">{week.theme}</h3>
                  <p className="week-desc">{week.description}</p>
                  <div className="week-words">
                    {week.coreWords.map((word, i) => (
                      <span key={word} className="word-tag" style={{animationDelay: `${i * 0.08}s`}}>{word}</span>
                    ))}
                  </div>
                  <div className="week-footer">
                    <div className="week-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${getWeekProgress(week.week)}%` }}
                        ></div>
                      </div>
                      <span className="progress-pill">{getWeekProgress(week.week)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {view === 'week' && !showMaterials && (
          <>
            <button className="back-btn" onClick={() => setView('overview')}>
              ← Back to Garden
            </button>
            
            <div className="week-header">
              <div className="week-header-top">
                <span className="week-badge" style={{ '--week-accent': getWeekAccent(selectedWeek) } as React.CSSProperties}>Week {selectedWeek}</span>
                <div className="week-progress-badge">
                  <span className="progress-star">⭐</span>
                  <span>{getWeekProgress(selectedWeek)}% Complete</span>
                </div>
              </div>
              <h2>{currentWeekData.theme}</h2>
              <p className="week-description">{currentWeekData.description}</p>
              
              <div className="learning-goals">
                <h4>🎯 Learning Goals:</h4>
                <ul>
                  {currentWeekData.learningGoals.map((goal, i) => (
                    <li key={i}>{goal}</li>
                  ))}
                </ul>
              </div>
              
              <div className="core-words-section">
                <h4>📝 Words to Learn:</h4>
                <div className="core-words">
                  {currentWeekData.coreWords.map(word => (
                    <span key={word} className="word-chip">{word}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="days-tabs">
              {currentWeekData.days.map((day) => (
                <button
                  key={day.day}
                  className={`day-tab ${selectedDay === day.day ? 'active' : ''}`}
                  onClick={() => setSelectedDay(day.day)}
                >
                  <span className="day-emoji">{['🌞', '🌻', '🌺', '🌸', '🎉'][day.day - 1]}</span>
                  <span className="day-name">{day.dayName}</span>
                </button>
              ))}
            </div>

            <div className="schedule-view">
              <ScheduleBlock 
                block={currentDayData.literacyHabit} 
                id={getActivityId(selectedWeek, selectedDay, 'literacy')}
                color="#f97316"
                icon="📖"
                label="Reading"
                assets={getAssetsForBlock(selectedWeek, selectedDay, 'literacy')}
                onOpenAsset={setAssetModal}
                isCompleted={isActivityCompleted(getActivityId(selectedWeek, selectedDay, 'literacy'))}
                onToggle={() => toggleActivity(getActivityId(selectedWeek, selectedDay, 'literacy'))}
              />
              <ScheduleBlock 
                block={currentDayData.gardenObservation} 
                id={getActivityId(selectedWeek, selectedDay, 'observation')}
                color="#10b981"
                icon="🌱"
                label="Garden"
                assets={getAssetsForBlock(selectedWeek, selectedDay, 'observation')}
                onOpenAsset={setAssetModal}
                isCompleted={isActivityCompleted(getActivityId(selectedWeek, selectedDay, 'observation'))}
                onToggle={() => toggleActivity(getActivityId(selectedWeek, selectedDay, 'observation'))}
              />
              <ScheduleBlock 
                block={currentDayData.scienceLab} 
                id={getActivityId(selectedWeek, selectedDay, 'science')}
                color="#3b82f6"
                icon="🔬"
                label="Science"
                assets={getAssetsForBlock(selectedWeek, selectedDay, 'science')}
                onOpenAsset={setAssetModal}
                isCompleted={isActivityCompleted(getActivityId(selectedWeek, selectedDay, 'science'))}
                onToggle={() => toggleActivity(getActivityId(selectedWeek, selectedDay, 'science'))}
              />
              <ScheduleBlock 
                block={currentDayData.mathBlock} 
                id={getActivityId(selectedWeek, selectedDay, 'math')}
                color="#8b5cf6"
                icon="🔢"
                label="Math"
                assets={getAssetsForBlock(selectedWeek, selectedDay, 'math')}
                onOpenAsset={setAssetModal}
                isCompleted={isActivityCompleted(getActivityId(selectedWeek, selectedDay, 'math'))}
                onToggle={() => toggleActivity(getActivityId(selectedWeek, selectedDay, 'math'))}
              />
              <ScheduleBlock 
                block={currentDayData.readingWriting} 
                id={getActivityId(selectedWeek, selectedDay, 'reading')}
                color="#ec4899"
                icon="✏️"
                label="Writing"
                assets={getAssetsForBlock(selectedWeek, selectedDay, 'reading')}
                onOpenAsset={setAssetModal}
                isCompleted={isActivityCompleted(getActivityId(selectedWeek, selectedDay, 'reading'))}
                onToggle={() => toggleActivity(getActivityId(selectedWeek, selectedDay, 'reading'))}
              />
              <ScheduleBlock 
                block={currentDayData.oralReflection} 
                id={getActivityId(selectedWeek, selectedDay, 'reflection')}
                color="#f59e0b"
                icon="🎤"
                label="Talk Time"
                assets={getAssetsForBlock(selectedWeek, selectedDay, 'reflection')}
                onOpenAsset={setAssetModal}
                isCompleted={isActivityCompleted(getActivityId(selectedWeek, selectedDay, 'reflection'))}
                onToggle={() => toggleActivity(getActivityId(selectedWeek, selectedDay, 'reflection'))}
              />
            </div>
          </>
        )}

        {showMaterials && (
          <>
            <button className="back-btn" onClick={() => setShowMaterials(false)}>
              ← Back to Learning Plan
            </button>
            
            <div className="materials-view">
              <h2>📦 My Garden Supplies</h2>
              <p className="materials-intro">
                Here's what you'll need for each week! Ask a grown-up to help you gather them.
              </p>
              
              {Object.entries(materials).map(([week, items]) => (
                <div key={week} className="materials-week">
                  <h3>Week {week}: {CURRICULUM[parseInt(week)-1].theme}</h3>
                  <ul>
                    {items.map((item, i) => (
                      <li key={i}>
                        <label className="material-item">
                          <input type="checkbox" />
                          <span className="material-text">{item}</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

interface ScheduleBlockProps {
  block: ActivityBlock;
  id: string;
  color: string;
  icon: string;
  label: string;
  assets: LessonAsset[];
  onOpenAsset: (asset: LessonAsset) => void;
  isCompleted: boolean;
  onToggle: () => void;
}

function ScheduleBlock({ block, color, icon, label, assets, onOpenAsset, isCompleted, onToggle }: ScheduleBlockProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div 
      className={`schedule-block ${isCompleted ? 'completed' : ''}`}
      style={{ '--block-color': color } as React.CSSProperties}
    >
      <div className="block-header" onClick={() => setExpanded(!expanded)}>
        <div className="block-icon" style={{ backgroundColor: color + '20' }}>
          <span className="block-emoji">{icon}</span>
        </div>
        <div className="block-info">
          <span className="block-time">{block.time}</span>
          <h3 className="block-title">{block.title}</h3>
          <span className="block-label" style={{ color }}>{label}</span>
        </div>
        <div className="block-actions">
          <button 
            className={`complete-btn ${isCompleted ? 'checked' : ''}`}
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
            style={{ backgroundColor: isCompleted ? color : 'transparent', borderColor: color }}
          >
            <span className="check-icon">{isCompleted ? '✓' : ''}</span>
          </button>
          <span className="expand-icon">{expanded ? '▲' : '▼'}</span>
        </div>
      </div>
      
      {expanded && (
        <div className="block-content">
          <ul className="activities-list">
            {block.activities.filter(a => a).map((activity, i) => (
              <li key={i}>{activity}</li>
            ))}
          </ul>
          {assets.length > 0 && (
            <div className="asset-links">
              <h4>Class Assets</h4>
              <div className="asset-link-list">
                {assets.map(asset => (
                  <button
                    key={asset.file}
                    className="asset-link-button"
                    onClick={() => onOpenAsset(asset)}
                  >
                    <span>{asset.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;


