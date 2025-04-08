import { catchAsync } from "../../utils/catchAsync.js";
import Addiction from "../../database/models/addection.model.js";
import { differenceInDays, isSameDay } from "date-fns";
import { AppError } from "../../utils/AppError.js";

// Get user's progress for all addictions
export const getProgress = catchAsync(async (req, res) => {
  let progress = await Addiction.findOne({ user: req.user._id });

  if (!progress) {
    progress = await Addiction.create({
      user: req.user._id,
      addictions: [],
    });
  } else {
    const today = new Date();
    let hasUpdates = false;

    // Check each addiction for missed check-ins
    progress.addictions.forEach((addiction) => {
      if (addiction.lastCheckIn) {
        const diff = differenceInDays(today, new Date(addiction.lastCheckIn));
        if (diff > 1) {
          // Reset streak if more than one day has passed
          addiction.streak = 0;
          hasUpdates = true;
        }
      }
    });

    // Save if any streaks were reset
    if (hasUpdates) {
      await progress.save();
    }
  }

  res.status(200).json({
    status: "success",
    data: {
      addictions: progress.addictions,
    },
  });
});

// Handle daily check-in for specific addiction
export const checkIn = catchAsync(async (req, res) => {
  const { category } = req.body;
  if (!category) {
    throw new AppError("Addiction category is required", 400);
  }

  const today = new Date();
  let userProgress = await Addiction.findOne({ user: req.user._id });

  // Create new progress if doesn't exist
  if (!userProgress) {
    userProgress = await Addiction.create({
      user: req.user._id,
      addictions: [
        {
          category,
          days: [today],
          lastCheckIn: today,
          streak: 1,
        },
      ],
    });
  } else {
    // Find the specific addiction category
    let addiction = userProgress.addictions.find(
      (a) => a.category === category
    );

    if (!addiction) {
      // Create new addiction category
      userProgress.addictions.push({
        category,
        days: [today],
        lastCheckIn: today,
        streak: 1,
      });
    } else {
      // Check if already checked in today
      if (
        addiction.lastCheckIn &&
        isSameDay(new Date(addiction.lastCheckIn), today)
      ) {
        throw new AppError("Already checked in today for this addiction", 400);
      }

      // Calculate streak
      let newStreak = addiction.streak;
      if (addiction.lastCheckIn) {
        const diff = differenceInDays(today, new Date(addiction.lastCheckIn));
        if (diff === 1) {
          // Consecutive day
          newStreak += 1;
        } else if (diff > 1) {
          // Streak broken
          newStreak = 1;
        }
      } else {
        newStreak = 1;
      }

      // Update addiction progress
      addiction.days.push(today);
      addiction.lastCheckIn = today;
      addiction.streak = newStreak;

      if (addiction.streak >= addiction.targetDays) {
        // Achievement unlocked!
        res.status(200).json({
          status: "success",
          message: "Congratulations! You've reached your target streak!",
          data: {
            addictions: userProgress.addictions,
            achievementUnlocked: true,
            progress: addiction.progress,
          },
        });
        return;
      }
    }

    await userProgress.save();
  }

  res.status(200).json({
    status: "success",
    data: {
      addictions: userProgress.addictions,
    },
  });
});

// Reset progress for specific addiction
export const resetProgress = catchAsync(async (req, res) => {
  const { category } = req.body;
  if (!category) {
    throw new AppError("Addiction category is required", 400);
  }

  const userProgress = await Addiction.findOne({ user: req.user._id });
  if (!userProgress) {
    throw new AppError("No progress found", 404);
  }

  const addictionIndex = userProgress.addictions.findIndex(
    (a) => a.category === category
  );
  if (addictionIndex === -1) {
    throw new AppError("Addiction category not found", 404);
  }

  userProgress.addictions[addictionIndex] = {
    category,
    days: [],
    lastCheckIn: null,
    streak: 0,
  };

  await userProgress.save();

  res.status(200).json({
    status: "success",
    message: "Progress reset successfully",
    data: {
      addiction: userProgress.addictions[addictionIndex],
    },
  });
});

// Add new addiction category
export const addAddiction = catchAsync(async (req, res) => {
  const { category } = req.body;
  if (!category) {
    throw new AppError("Addiction category is required", 400);
  }

  let userProgress = await Addiction.findOne({ user: req.user._id });

  if (!userProgress) {
    userProgress = await Addiction.create({
      user: req.user._id,
      addictions: [
        {
          category,
          days: [],
          lastCheckIn: null,
          streak: 0,
        },
      ],
    });
  } else {
    // Check if category already exists
    if (userProgress.addictions.some((a) => a.category === category)) {
      throw new AppError("Addiction category already exists", 400);
    }

    userProgress.addictions.push({
      category,
      days: [],
      lastCheckIn: null,
      streak: 0,
    });

    await userProgress.save();
  }

  res.status(201).json({
    status: "success",
    data: {
      addictions: userProgress.addictions,
    },
  });
});


// Remove addiction category
export const removeAddiction = catchAsync(async (req, res) => {
  const { category } = req.body;
  if (!category) {
    throw new AppError("Addiction category is required", 400);
  }

  const userProgress = await Addiction.findOne({ user: req.user._id });
  if (!userProgress) {
    throw new AppError("No progress found", 404);
  }

  // Check if the category exists
  const addictionIndex = userProgress.addictions.findIndex(
    (a) => a.category === category
  );

  if (addictionIndex === -1) {
    throw new AppError("Addiction category not found", 404);
  }

  // Remove the category from the addictions array
  userProgress.addictions.splice(addictionIndex, 1);
  await userProgress.save();

  res.status(200).json({
    status: "success",
    message: "Addiction category removed successfully",
    data: {
      addictions: userProgress.addictions,
    },
  });
});
