// Components/ArticlesScreen.js
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Modal,
  ScrollView,
  Share,
  Dimensions,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width: W } = Dimensions.get('window');

const BR = {
  bg:    '#180A12',
  card:  '#2B1A27',
  text:  '#FFFFFF',
  sub:   'rgba(255,255,255,0.78)',
  line:  'rgba(255,255,255,0.12)',
  gold1: '#FFB400',
  gold2: '#FF6A00',
  chip:  '#4B2E2A',
};

// icons (WEBP)
const icChevronRight = require('../assets/ic_chevron_right.webp');
const icClose        = require('../assets/ic_close.webp');
const icShareArrow   = require('../assets/ic_chevron_up.webp'); // повернём на 45°
const icInfo         = require('../assets/ic_info.webp');

// content
const RAW = {
  tinyWins: `Progress rarely arrives with a drumroll. It usually shows up as five honest minutes that you almost skipped. Tiny wins matter because they are the only part of growth you can control every single day. When you lower the start line, you remove the hardest step in training, which is not the final rep or the last kilometer, but the moment you begin. Set a minimum session that you can complete on your worst day. Two sets, one drill, a short mobility flow, a walk around the block. If you feel better once you start, keep going. If you don’t, you still won. Momentum lives in the decision to show up.
Think of identity as a muscle. Every time you complete a small plan, you cast a vote for the kind of person you are becoming. Those votes stack faster than perfect big days. This is why streaks help. A streak is not pressure to never miss. It is a reminder that yesterday’s effort can make today’s choice easier. When life gets messy, protect the streak with a smaller session instead of skipping. The arrow is more important than the length of the line.
Design your environment to make the first minute effortless. Put the shoes near the door, the water bottle on the desk, the mat on the floor, the playlist ready. Reduce the number of choices between you and action. Pair a routine with an existing cue so you never depend on motivation alone. After brushing teeth, do ten slow squats. After school, take a ten-minute walk. After opening the app, start the timer. The brain loves patterns that begin the same way each time.
Keep score in a way that rewards honesty. Log how you felt, not just what you did. Write what made today harder and what made it easier. Over time you will see which hours, places, and people support your best training. Use that information to build a day that nudges you forward without a fight. You do not need to be extreme. You need to be consistent. Tiny wins create a rhythm. Rhythm creates flow. Flow carries you on days when motivation is quiet.
(General guidance only. If you have a medical condition or injury, talk to a professional before changing your routine.)`,
  wheelCheck: `Your Better Flow Wheel is not a report card. It is a compass. Scores change because life changes, and that is the point. When you rate Energy, Sleep, Mood, Discipline, Social, Learning, Nutrition, and Training, you take a snapshot of how your system feels right now. Do it with simple honesty. A six is not failure. It is a signal that helps you choose the next step with more accuracy than guesswork.
Look for patterns across a week instead of chasing single days. If Sleep dips, notice what happened twelve hours earlier. If Mood rises after morning light or a walk with a friend, record it. High points deserve protection, not just celebration. Low points deserve one small action, not a full rebuild. Pick one lever per day. If Energy is low, shorten the session and extend the warm-up. If Discipline slips, reduce the friction to start. If Social feels empty, invite someone to join a session or send a check-in message before you train. The wheel suggests direction. You decide distance.
Re-rating helps more than rethinking. When you feel stuck, open the survey and score again before planning anything. This resets the story in your head to the facts in your body. Over a month, your wheel will show the shape of your life. Most people discover that training improves when sleep stabilizes, and that mood follows motion more than talk. Use the wheel to plan the smallest powerful change for tomorrow. Use it again to see if that change landed. Data becomes wisdom only when it meets action.`,
  trainingSticks: `A plan that survives busy days is better than a plan that impresses on easy ones. Start by deciding your default training week. Pick a small number of sessions you can repeat without drama. Anchor each session to a time and a trigger. Right after school. Right before dinner. Right after you put the bag down. Build a simple start line ritual that never changes: water, timer, warm-up drill. The ritual is the bridge from thinking to moving.
Use effort you can feel, not just numbers you can chase. Rate each session on how hard it felt from one to ten. Most base work belongs in the middle where you can breathe and speak. Sprinkle hard work so you can recover and come back tomorrow. Progress grows when you repeat a pattern and add the lightest challenge. One more rep. Two more minutes. A little faster finish. If your form breaks, the weight is too heavy. If your sleep breaks, the week is too heavy.
Recovery is training with a different face. Mobility, easy movement, and short walks keep blood flowing and moods steady. Rest days protect progress instead of slowing it. When you miss a session, close the loop within twenty-four hours with a small effort, even if it is just a warm-up. The goal is not a perfect week. The goal is a week that keeps you in the game. Log what you did and how it felt. When you look back, you will notice that the sessions you almost skipped often become the ones you are most proud of. That is how training sticks.`,
  sleepPractice: `Sleep is not a reward for finishing the day. It is part of training. Muscles repair at night. The brain files memories and skills. Mood resets. The fastest way to improve performance without adding stress is to make sleep more predictable. Aim for regular bed and wake times, even on weekends. Your body learns the rhythm you repeat and responds with deeper rest.
Light is the strongest signal your brain understands. Give your morning eyes real daylight as soon as you can. In the evening dim screens and overhead lights so your brain hears the message that night has actually begun. Create a wind-down that you repeat, not because it is perfect but because it is the same. Stretch for a few minutes, read a simple page, breathe slow. Keep your room cool and quiet. If your mind races, write tomorrow’s first step on paper and put the paper away. You are not solving the future at midnight.
Caffeine and heavy food can push sleep away when you need it close. Keep the last coffee well before evening and leave a little space between dinner and bed. If you nap, keep it short and early so it helps instead of disrupting the main event. Some nights still go sideways. That is normal. Get up at your usual time anyway. The next night will often correct itself when your clock stays steady. Treat sleep like practice, calm and patient. You will feel it in your training and in your wheel.`,
  simpleFuel: `Food is fuel, but it is also culture, family, and comfort. The easiest way to eat for performance without overthinking is to focus on a balanced plate most of the time. Build meals around simple anchors you can repeat. A source of protein to repair and grow. A source of slow carbs or grains for steady energy. Color from fruits and vegetables for fiber and micronutrients. Liquid that is mostly water. You do not need complicated rules to feel better. You need meals that make training and sleep easier.
Before a workout, choose something light that sits well in your stomach. A small snack with quick carbs can wake up the session. After a workout, bring protein and carbs back to the table so your body can rebuild what it used. On busy days, plan the snacks that prevent the crash. A banana in the bag. Nuts in a small container. Yogurt, if you enjoy it. If not, pick another option that fits your life. Perfection is not required. Predictability is powerful.
Pay attention to how food makes you feel two hours later. Notice which breakfasts give you stable energy in class and which dinners support calm sleep instead of restless nights. Hydration matters more than most people think. Keep a bottle near you and sip through the day rather than trying to fix it at night. Food is a long game. Small steady choices beat short strict plans. Eat in a way you can repeat when life is not tidy. Your body will thank you in training and in the mirror you see less often.
(General guidance only. For allergies, medical needs, or weight-specific plans, consult a professional.)`,
  onHardDays: `Hard days are not a sign that you are failing. They are part of the plan. The key is to stop arguing with the day and start negotiating. Lower the bar until it is impossible not to start. Promise yourself five minutes. Put on the shoes and walk to the first corner. Open the app and press start. Most of the time momentum shows up once you begin. If it does not, you still protected the habit, which protects the identity that will carry you tomorrow.
Use if-then plans to beat excuses before they speak. If rain ruins the run, then do a ten-minute mobility circuit. If homework stacks up, then train in two five-minute breaks instead of one long block. If you feel flat, then switch the goal from intensity to form. You do not need to be brave for an hour. You need to be brave for thirty seconds while you start. After that, gravity helps.
Talk to yourself like a coach you respect. Harsh self-talk might push you once, but it exhausts you across a season. Encouragement is not softness. It is fuel. Tell the truth about the day and choose the smallest honest win. When the session ends, log it and write one sentence about what worked. That sentence will be there for the next hard day, when you need proof from your past self that you can do this again. Hard days teach the lessons that easy days never ask of you. Keep them. Use them. Move on.`,
  beyondMirror: `Photos can inspire or trap. The difference is the story you attach to them. Use images to document a journey, not to judge a moment. Take pictures on a schedule you choose in advance and keep it slow enough to be kind. Same time of day, similar light, similar pose. This gives you a fair comparison that focuses on change instead of distortion. Store pairs and review them with distance. A month tells you more than a week. A season tells you more than a month.
Let visuals share the stage with performance and well-being. Track the first push-up, the longer plank, the easier run, the calmer morning. Write what you did to earn those changes. When you look at the gallery, read the notes before you stare at the pixels. Progress is often strongest where a camera cannot see it. You will feel it in the way you climb stairs, sleep through the night, or answer a hard message with calm instead of speed.
Share with intention if you decide to share at all. Choose audiences who celebrate effort, not just outcomes. Respect your privacy. Respect other people’s privacy. When old photos carry unhelpful stories, archive them. You are allowed to release pictures that no longer serve your growth. The goal is not to become someone else on a screen. The goal is to become more yourself in real life. Let the gallery bear witness, not pass judgment. Let it remind you that you are building something that lasts.`,
};

const ARTICLES = [
  { id: 'tiny',   title: 'TINY WINS',            body: RAW.tinyWins },
  { id: 'wheel',  title: 'WHEEL CHECK',          body: RAW.wheelCheck },
  { id: 'stick',  title: 'TRAINING THAT STICKS', body: RAW.trainingSticks },
  { id: 'sleep',  title: 'SLEEP IS PRACTICE',    body: RAW.sleepPractice },
  { id: 'fuel',   title: 'SIMPLE FUEL',          body: RAW.simpleFuel },
  { id: 'hard',   title: 'ON HARD DAYS',         body: RAW.onHardDays },
  { id: 'beyond', title: 'BEYOND THE MIRROR',    body: RAW.beyondMirror },
];

const DISCLAIMER =
  'General guidance only. If you have a medical condition or injury, talk to a professional before changing your routine.';

export default function ArticlesScreen() {
  const [active, setActive] = useState(null);

  const data = useMemo(() => {
    return ARTICLES.map(a => ({
      ...a,
      snippet: a.body.replace(/\u2028|\u2029|\u200A|\u200B|\u00A0/g, ' ')
                     .split('\n').join(' ')
                     .slice(0, 130) + ' ...',
    }));
  }, []);

  return (
    <View style={styles.wrap}>
      <Text style={styles.h1}>DISCOVER. LEARN. STAY{'\n'}INSPIRED.</Text>

      <FlatList
        data={data}
        keyExtractor={(it) => it.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120, gap: 14 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.snippet}>{item.snippet}</Text>
            </View>

            <Pressable onPress={() => setActive(item)} style={{ marginLeft: 12 }}>
              <LinearGradient colors={[BR.gold1, BR.gold2]} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.arrowBtn}>
                <Image source={icChevronRight} style={styles.arrowIcon} />
              </LinearGradient>
            </Pressable>
          </View>
        )}
      />

      <ArticleModal
        article={active}
        onClose={() => setActive(null)}
      />
    </View>
  );
}

function ArticleModal({ article, onClose }) {
  if (!article) return null;

  const [showInfo, setShowInfo] = useState(false);
  const bodyParas = article.body.replace(/\u2028|\u2029/g, '\n').split('\n');

  const shareIt = async () => {
    try {
      await Share.share({
        message: `${article.title}\n\n${article.body}`,
      });
    } catch {}
  };

  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalWrap}>
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Pressable onPress={shareIt} style={styles.hBtn}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={styles.hBtnTxt}>Share</Text>
                <Image source={icShareArrow} style={styles.shareIcon} />
              </View>
            </Pressable>

            <Pressable onPress={onClose} style={[styles.hBtn, { backgroundColor: BR.card, borderWidth: 0 }]}>
              <Image source={icClose} style={styles.closeIcon} />
            </Pressable>
          </View>

          <View style={styles.titleRow}>
            <Text style={styles.modalTitle}>{article.title}</Text>
            <Pressable onPress={() => setShowInfo(v => !v)} style={styles.infoBtn}>
              <Image source={icInfo} style={styles.infoIcon} />
            </Pressable>
          </View>

          {showInfo && (
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>{DISCLAIMER}</Text>
            </View>
          )}

          <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
            {bodyParas.map((p, i) =>
              p.trim().length ? (
                <Text key={i} style={styles.p}>
                  {p.trim()}
                </Text>
              ) : <View key={i} style={{ height: 6 }} />
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: BR.bg },
  h1: {
    color: BR.text, fontSize: 28, fontWeight: '800',
    paddingHorizontal: 16, paddingTop: 16, marginBottom: 10,
  },

  card: {
    flexDirection: 'row',
    backgroundColor: BR.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  title: { color: BR.text, fontSize: 20, fontWeight: '800', marginBottom: 8 },
  snippet: { color: BR.sub, fontSize: 15, lineHeight: 20 },

  arrowBtn: {
    width: 54, height: 54, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  arrowIcon: { width: 22, height: 22, tintColor: '#fff', resizeMode: 'contain' },

  modalWrap: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: BR.card,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    maxHeight: '90%',
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  sheetHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, marginBottom: 8,
  },
  hBtn: {
    borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 16, height: 48, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  hBtnTxt: { color: BR.text, fontSize: 16, fontWeight: '700' },

  closeIcon: { width: 20, height: 20, tintColor: '#fff' },
  shareIcon: { width: 18, height: 18, tintColor: '#fff', transform: [{ rotate: '45deg' }] },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  modalTitle: {
    color: BR.text, fontSize: 26, fontWeight: '800',
    paddingRight: 12,
  },
  infoBtn: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: BR.card, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  infoIcon: { width: 18, height: 18, tintColor: '#fff' },
  infoBox: {
    marginHorizontal: 16, marginBottom: 12,
    backgroundColor: BR.card,
    borderRadius: 14, padding: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  infoText: { color: BR.sub, fontSize: 13, lineHeight: 18 },

  p: {
    color: BR.text, opacity: 0.94,
    fontSize: 16, lineHeight: 24,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
});
