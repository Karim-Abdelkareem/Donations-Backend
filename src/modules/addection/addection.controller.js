// استيراد المكتبات والوحدات المطلوبة
import { catchAsync } from "../../utils/catchAsync.js";
import Addiction from "../../database/models/addection.model.js";
import { differenceInDays, isSameDay } from "date-fns";
import { AppError } from "../../utils/AppError.js";

// الحصول على تقدم المستخدم لجميع الإدمانات
export const getProgress = catchAsync(async (req, res) => {
  // البحث عن تقدم المستخدم في قاعدة البيانات
  let progress = await Addiction.findOne({ user: req.user._id });

  if (!progress) {
    // إنشاء سجل جديد إذا لم يكن موجوداً
    progress = await Addiction.create({
      user: req.user._id,
      addictions: [],
    });
  } else {
    const today = new Date();
    let hasUpdates = false;

    // التحقق من كل إدمان للتسجيلات الفائتة
    progress.addictions.forEach((addiction) => {
      if (addiction.lastCheckIn) {
        const diff = differenceInDays(today, new Date(addiction.lastCheckIn));
        if (diff > 1) {
          // إعادة تعيين التتابع إذا مر أكثر من يوم
          addiction.streak = 0;
          hasUpdates = true;
        }
      }
    });

    // حفظ التغييرات إذا تم إعادة تعيين أي تتابع
    if (hasUpdates) {
      await progress.save();
    }
  }

  // إرسال الاستجابة
  res.status(200).json({
    status: "success",
    data: {
      addictions: progress.addictions,
    },
  });
});

// معالجة تسجيل الدخول اليومي لإدمان محدد
export const checkIn = catchAsync(async (req, res) => {
  // التحقق من وجود الفئة
  const { category } = req.body;
  if (!category) {
    throw new AppError("Addiction category is required", 400);
  }

  const today = new Date();
  let userProgress = await Addiction.findOne({ user: req.user._id });

  // إنشاء تقدم جديد إذا لم يكن موجوداً
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
    // البحث عن فئة الإدمان المحددة
    let addiction = userProgress.addictions.find(
      (a) => a.category === category
    );

    if (!addiction) {
      // إنشاء فئة إدمان جديدة
      userProgress.addictions.push({
        category,
        days: [today],
        lastCheckIn: today,
        streak: 1,
      });
    } else {
      // التحقق مما إذا تم التسجيل اليوم
      if (
        addiction.lastCheckIn &&
        isSameDay(new Date(addiction.lastCheckIn), today)
      ) {
        throw new AppError("Already checked in today for this addiction", 400);
      }

      // حساب التتابع
      let newStreak = addiction.streak;
      if (addiction.lastCheckIn) {
        const diff = differenceInDays(today, new Date(addiction.lastCheckIn));
        if (diff === 1) {
          // يوم متتالي
          newStreak += 1;
        } else if (diff > 1) {
          // انقطاع التتابع
          newStreak = 1;
        }
      } else {
        newStreak = 1;
      }

      // تحديث تقدم الإدمان
      addiction.days.push(today);
      addiction.lastCheckIn = today;
      addiction.streak = newStreak;

      // التحقق من تحقيق الهدف
      if (addiction.streak >= addiction.targetDays) {
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

// إعادة تعيين التقدم لإدمان محدد
export const resetProgress = catchAsync(async (req, res) => {
  const { category } = req.body;
  if (!category) {
    throw new AppError("Addiction category is required", 400);
  }

  const userProgress = await Addiction.findOne({ user: req.user._id });
  if (!userProgress) {
    throw new AppError("No progress found", 404);
  }

  // البحث عن فئة الإدمان
  const addictionIndex = userProgress.addictions.findIndex(
    (a) => a.category === category
  );
  if (addictionIndex === -1) {
    throw new AppError("Addiction category not found", 404);
  }

  // إعادة تعيين البيانات
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

// إضافة فئة إدمان جديدة
export const addAddiction = catchAsync(async (req, res) => {
  const { category } = req.body;
  if (!category) {
    throw new AppError("Addiction category is required", 400);
  }

  let userProgress = await Addiction.findOne({ user: req.user._id });

  if (!userProgress) {
    // إنشاء سجل جديد مع الفئة الجديدة
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
    // التحقق من وجود الفئة مسبقاً
    if (userProgress.addictions.some((a) => a.category === category)) {
      throw new AppError("Addiction category already exists", 400);
    }

    // إضافة الفئة الجديدة
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

// حذف فئة إدمان
export const removeAddiction = catchAsync(async (req, res) => {
  const { category } = req.body;
  if (!category) {
    throw new AppError("Addiction category is required", 400);
  }

  const userProgress = await Addiction.findOne({ user: req.user._id });
  if (!userProgress) {
    throw new AppError("No progress found", 404);
  }

  // البحث عن الفئة
  const addictionIndex = userProgress.addictions.findIndex(
    (a) => a.category === category
  );

  if (addictionIndex === -1) {
    throw new AppError("Addiction category not found", 404);
  }

  // حذف الفئة من المصفوفة
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
