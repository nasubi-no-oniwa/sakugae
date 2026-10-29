// =============================================
//  ことば（日本語・English・繁體中文・한국어）
//  ===========================================

(function () {
  var LANGS = ['ja', 'en', 'zh', 'ko'];
  var KEY = 'sakugae-lang';
  var D = {
 "lang_label": [
  "ことば",
  "Language",
  "語言",
  "언어"
 ],
 "home": [
  "なすびのお庭へ",
  "Nasubi's Garden (more games)",
  "前往茄子的庭院",
  "가지의 정원으로"
 ],
 "howto": [
  "あそびかた",
  "How to play",
  "玩法",
  "플레이 방법"
 ],
 "close": [
  "とじる",
  "Close",
  "關閉",
  "닫기"
 ],
 "back": [
  "もどる",
  "Back",
  "返回",
  "돌아가기"
 ],
 "to_title": [
  "タイトルへ",
  "Back to title",
  "回到標題",
  "타이틀로"
 ],
 "again": [
  "もう一回",
  "Play again",
  "再來一局",
  "한 판 더"
 ],
 "easy": [
  "よわい",
  "Easy",
  "簡單",
  "약함"
 ],
 "normal": [
  "ふつう",
  "Normal",
  "普通",
  "보통"
 ],
 "hard": [
  "つよい",
  "Hard",
  "困難",
  "강함"
 ],
 "vs_cpu": [
  "CPUとたいせん",
  "VS CPU",
  "對戰CPU",
  "CPU와 대전"
 ],
 "online": [
  "あいことばで対戦",
  "Play with a passcode",
  "用暗號對戰",
  "암호로 대전"
 ],
 "passcode": [
  "あいことば",
  "Passcode",
  "暗號",
  "암호"
 ],
 "name": [
  "なまえ",
  "Name",
  "名字",
  "이름"
 ],
 "noname": [
  "ななし",
  "Anonymous",
  "無名氏",
  "익명"
 ],
 "online_hint": [
  "同じあいことばを入れた人と対戦。3人目からは観戦になります。",
  "Play against whoever enters the same passcode. From the 3rd person on, you watch.",
  "和輸入相同暗號的人對戰。第3個人開始為觀戰。",
  "같은 암호를 입력한 사람과 대전. 3번째 사람부터는 관전이 됩니다."
 ],
 "join": [
  "はいる",
  "Join",
  "進入",
  "입장"
 ],
 "wait_pre": [
  "あいことば「",
  "Passcode: ",
  "暗號「",
  "암호 「"
 ],
 "wait_post": [
  "」",
  "",
  "」",
  "」"
 ],
 "waiting": [
  "あいてを待っています…",
  "Waiting for an opponent…",
  "等待對手中…",
  "상대를 기다리는 중…"
 ],
 "copy_link": [
  "さそうリンクをコピー",
  "Copy invite link",
  "複製邀請連結",
  "초대 링크 복사"
 ],
 "copied": [
  "コピーしました！",
  "Copied!",
  "已複製！",
  "복사했어요!"
 ],
 "send_link": [
  "このリンクを送ってください",
  "Send this link",
  "請傳送這個連結",
  "이 링크를 보내 주세요"
 ],
 "err_code": [
  "あいことばを入れてください（. # $ / [ ] は使えません）",
  "Enter a passcode (. # $ / [ ] are not allowed)",
  "請輸入暗號（不能使用 . # $ / [ ]）",
  "암호를 입력해 주세요 (. # $ / [ ] 는 사용할 수 없어요)"
 ],
 "err_code_short": [
  "あいことばを入れてください",
  "Enter a passcode",
  "請輸入暗號",
  "암호를 입력해 주세요"
 ],
 "connecting": [
  "つないでいます…",
  "Connecting…",
  "連線中…",
  "연결 중…"
 ],
 "err_net": [
  "通信できませんでした。電波のよいところでもう一度ためしてください",
  "Couldn't connect. Please try again where the signal is better.",
  "無法連線。請在訊號好的地方再試一次。",
  "연결하지 못했어요. 신호가 좋은 곳에서 다시 시도해 주세요."
 ],
 "err_notready": [
  "オンライン対戦はまだ準備中です",
  "Online play isn't ready yet",
  "線上對戰還在準備中",
  "온라인 대전은 아직 준비 중이에요"
 ],
 "err_conn": [
  "つながりませんでした",
  "Couldn't connect",
  "無法連線",
  "연결되지 않았어요"
 ],
 "left_win": [
  "相手が抜けたので、あなたの勝ち！",
  "Your opponent left, so you win!",
  "對手離開了，你贏了！",
  "상대가 나가서 당신의 승리!"
 ],
 "left": [
  "あいてが退室しました",
  "Your opponent left",
  "對手已離開",
  "상대가 퇴장했어요"
 ],
 "watch_in": [
  "観戦で入りました。試合が始まるのを待っています…",
  "You joined as a spectator. Waiting for the game to start…",
  "已用觀戰身分進入。等待比賽開始…",
  "관전으로 입장했어요. 경기 시작을 기다리는 중…"
 ],
 "wait_next": [
  "次の試合が始まるのを待っています…",
  "Waiting for the next game…",
  "等待下一局開始…",
  "다음 경기를 기다리는 중…"
 ],
 "wait_rematch": [
  "あいての「もう一回」を待っています…",
  "Waiting for your opponent to choose \"Play again\"…",
  "等待對手按「再來一局」…",
  "상대의 '한 판 더'를 기다리는 중…"
 ],
 "you": [
  "あなた",
  "You",
  "你",
  "나"
 ],
 "cpu": [
  "CPU",
  "CPU",
  "CPU",
  "CPU"
 ],
 "your_turn": [
  "あなたの番",
  "Your turn",
  "輪到你",
  "내 차례"
 ],
 "cpu_wait_label": [
  "CPU（ふつう）と遊びながら待つ",
  "Play the CPU (Normal) while waiting",
  "一邊和CPU（普通）玩一邊等",
  "기다리는 동안 CPU(보통)와 플레이"
 ],
 "qm_btn": [
  "だれかと対戦",
  "Play someone online",
  "隨機對戰",
  "아무나와 대전"
 ],
 "qm_stat": [
  "対戦待ち <b>{w}</b>人・対戦中 <b>{p}</b>組",
  "<b>{w}</b> waiting · <b>{p}</b> playing",
  "等待中 <b>{w}</b>人・對戰中 <b>{p}</b>組",
  "대기 <b>{w}</b>명 · 대전 중 <b>{p}</b>쌍"
 ],
 "qm_prime_hot": [
  "🔥 いま対戦タイム！（22時まで）",
  "🔥 Battle time now! (until 22:00 JST)",
  "🔥 現在是對戰時間！（到日本時間22點）",
  "🔥 지금은 대전 타임! (일본 시간 22시까지)"
 ],
 "qm_prime": [
  "🌙 毎晩21時〜22時は対戦タイム",
  "🌙 Battle time every night 21:00–22:00 JST",
  "🌙 每晚日本時間21〜22點是對戰時間",
  "🌙 매일 밤 일본 시간 21~22시는 대전 타임"
 ],
 "qm_sub": [
  "いま待っている人と、自動でつながります。",
  "You'll be matched automatically with someone who's waiting.",
  "自動和正在等待的人配對。",
  "기다리고 있는 사람과 자동으로 연결돼요."
 ],
 "qm_go": [
  "さがす",
  "Find a match",
  "尋找",
  "찾기"
 ],
 "qm_badname": [
  "その名前は使えません。ほかの名前にしてね",
  "That name can't be used. Please choose another.",
  "這個名字不能使用，請換一個。",
  "그 이름은 사용할 수 없어요. 다른 이름으로 해 주세요."
 ],
 "qm_searching": [
  "相手をさがしています",
  "Looking for an opponent",
  "正在尋找對手",
  "상대를 찾는 중"
 ],
 "qm_wait_pre": [
  "いま対戦待ち ",
  "Waiting now: ",
  "目前等待中 ",
  "현재 대기 "
 ],
 "qm_wait_post": [
  "人",
  "",
  "人",
  "명"
 ],
 "qm_cpu": [
  "CPUと遊びながら待つ",
  "Play the CPU while waiting",
  "一邊和CPU玩一邊等",
  "기다리는 동안 CPU와 플레이"
 ],
 "qm_cancel": [
  "やめる",
  "Cancel",
  "取消",
  "그만두기"
 ],
 "qm_retry": [
  "もう一度さがす",
  "Search again",
  "再找一次",
  "다시 찾기"
 ],
 "qm_searching_t": [
  "相手をさがしています… {t}",
  "Looking for an opponent… {t}",
  "正在尋找對手… {t}",
  "상대를 찾는 중… {t}"
 ],
 "qm_calling": [
  "CPUと遊んでいる人に声をかけています…",
  "Inviting someone who is playing the CPU…",
  "正在邀請正在和CPU玩的人…",
  "CPU와 플레이 중인 사람에게 신청하는 중…"
 ],
 "qm_declined": [
  "相手が見送りました。ほかの人をさがします",
  "They passed. Looking for someone else.",
  "對方跳過了，改找其他人。",
  "상대가 넘겼어요. 다른 사람을 찾을게요."
 ],
 "qm_found": [
  "相手が見つかりました！",
  "Opponent found!",
  "找到對手了！",
  "상대를 찾았어요!"
 ],
 "qm_avail": [
  "対戦できる相手がいます！",
  "Someone is ready to play!",
  "有可以對戰的對手！",
  "대전할 수 있는 상대가 있어요!"
 ],
 "qm_play": [
  "対戦する",
  "Play",
  "對戰",
  "대전하기"
 ],
 "qm_pass": [
  "見送る",
  "Pass",
  "跳過",
  "넘기기"
 ],
 "qm_taken": [
  "さっきの相手は、ほかの人と対戦を始めました。もう少し待ってね",
  "That player started a match with someone else. Please wait a little longer.",
  "剛才的對手已經和別人開始對戰了。請再等一下。",
  "방금 상대는 다른 사람과 대전을 시작했어요. 조금만 더 기다려 주세요."
 ],
 "qm_fail": [
  "相手とつながりませんでした（{c}）",
  "Couldn't connect to your opponent ({c})",
  "無法和對手連線（{c}）",
  "상대와 연결되지 않았어요 ({c})"
 ],
 "qm_nojoin": [
  "入れませんでした",
  "Couldn't join",
  "無法進入",
  "들어가지 못했어요"
 ],
 "qm_next": [
  "次の相手をさがす",
  "Find next opponent",
  "尋找下一位對手",
  "다음 상대 찾기"
 ],
 "doc_title": [
  "さくがえ",
  "Fence Swap",
  "柵欄互換",
  "울타리 체인지"
 ],
 "doc_desc": [
  "柵で道をつくって、相手の柵と入れかえろ。6レーンの陣取りタワーディフェンス。",
  "Build paths with fences, then swap them with your rival's. A 6-lane territory tower defense.",
  "用柵欄做出道路，再和對手的柵欄互換。6條路線的搶地盤塔防。",
  "울타리로 길을 만들고, 상대의 울타리와 바꿔라. 6레인 땅따먹기 타워 디펜스."
 ],
 "logo": [
  "さく<span>がえ</span>",
  "FENCE<span>SWAP</span>",
  "柵欄<span>互換</span>",
  "울타리<span>체인지</span>"
 ],
 "tagline": [
  "柵で道をつくって、相手の柵と入れかえろ。",
  "Build paths with fences. Swap them with your rival's.",
  "用柵欄做出道路，再和對手的柵欄互換。",
  "울타리로 길을 만들고, 상대의 울타리와 바꿔라."
 ],
 "quit": [
  "やめる",
  "Quit",
  "結束",
  "그만두기"
 ],
 "home_e": [
  "🍆 なすびのお庭へ",
  "🍆 Nasubi's Garden (more games)",
  "🍆 前往茄子的庭院",
  "🍆 가지의 정원으로"
 ],
 "h1": [
  "<b>下の城</b>があなた。レーンの下の <b>▲</b> を押してはなすと兵士が出ます（1コイン）。押しているあいだ、兵士の<b>道すじ</b>が点線で見えます。",
  "The <b>castle at the bottom</b> is yours. Press and release a <b>▲</b> under a lane to send a soldier (1 coin). While you hold it, the soldier's <b>path</b> shows as a dotted line.",
  "<b>下方的城</b>是你的。按住路線下方的 <b>▲</b> 再放開就會派出士兵（1枚金幣）。按住時會用虛線顯示士兵的<b>路線</b>。",
  "<b>아래쪽 성</b>이 나. 레인 아래의 <b>▲</b> 를 눌렀다 떼면 병사가 나가요 (1코인). 누르고 있는 동안 병사의 <b>경로</b>가 점선으로 보여요."
 ],
 "h2": [
  "兵士が相手の城に着くと <b>1ダメージ</b>。先に相手のHP10をけずったら勝ち。受けた側は<b>2コイン</b>もらえます。",
  "A soldier reaching the enemy castle deals <b>1 damage</b>. Knock the rival's 10 HP down first to win. The side that gets hit receives <b>2 coins</b>.",
  "士兵抵達對手的城就造成<b>1點傷害</b>。先把對手的10點HP打光就贏。被打的一方可以拿到<b>2枚金幣</b>。",
  "병사가 상대 성에 닿으면 <b>1 데미지</b>. 상대 HP 10을 먼저 깎으면 승리. 맞은 쪽은 <b>2코인</b>을 받아요."
 ],
 "h3": [
  "<b>自分の陣地（下半分）の線</b>を押すと柵を置けます（1コイン）。もう一度押すとこわせますが、<b>コインはもどりません</b>。横1列をまるごとふさぐことはできません。",
  "Tap a <b>line on your side (bottom half)</b> to place a fence (1 coin). Tap again to break it, but <b>you don't get the coin back</b>. You can't block an entire row.",
  "點<b>自己陣地（下半部）的線</b>就能放柵欄（1枚金幣）。再點一次可以拆掉，但<b>金幣不會退回</b>。不能把一整排橫向完全堵住。",
  "<b>내 진영(아래 절반)의 선</b>을 누르면 울타리를 놓아요 (1코인). 한 번 더 누르면 부술 수 있지만 <b>코인은 돌아오지 않아요</b>. 가로 한 줄을 통째로 막을 수는 없어요."
 ],
 "h4": [
  "兵士は前がふさがると横へ動きます。進めないままだと、しばらくして<b>目の前の柵をこわします</b>。",
  "When blocked, soldiers move sideways. If they stay stuck, after a while they <b>break the fence in front of them</b>.",
  "士兵前方被擋住就會往旁邊走。一直過不去的話，過一陣子會<b>拆掉眼前的柵欄</b>。",
  "병사는 앞이 막히면 옆으로 움직여요. 계속 못 가면 잠시 후 <b>눈앞의 울타리를 부숴요</b>."
 ],
 "h5": [
  "敵と味方の兵士がぶつかると相殺。おたがい1コインもらえます。",
  "When enemy and friendly soldiers collide, both vanish. Each side gets 1 coin.",
  "敵我士兵相撞就會互相抵銷，雙方各拿1枚金幣。",
  "적과 아군 병사가 부딪히면 상쇄. 서로 1코인씩 받아요."
 ],
 "h6": [
  "15秒ごとに、交互に<b>入れかえ</b>の番がきます。自分の列と相手の列を1つずつタップすると、3秒後に柵がまるごと入れかわります。",
  "Every 15 seconds, players take turns getting a <b>swap</b>. Tap one of your rows and one of the rival's rows, and 3 seconds later their fences swap completely.",
  "每15秒輪流得到一次<b>互換</b>的機會。點自己的一排和對手的一排，3秒後柵欄會整排互換。",
  "15초마다 번갈아 <b>체인지</b> 차례가 와요. 내 줄과 상대 줄을 하나씩 탭하면, 3초 후 울타리가 통째로 바뀌어요."
 ],
 "h7": [
  "入れかえでもらった<b>金色の柵</b>は、こわすと1コインになります。",
  "<b>Gold fences</b> you got from a swap give 1 coin when you break them.",
  "互換得到的<b>金色柵欄</b>，拆掉可以換1枚金幣。",
  "체인지로 받은 <b>금색 울타리</b>는 부수면 1코인이 돼요."
 ],
 "h8": [
  "<b>あいことばで対戦</b>：同じあいことばを入れた2人で対戦。どちらも自分の城が下に見えます。3人目からは観戦です。先に入った人が画面をはなれると、試合が止まります。",
  "<b>Play with a passcode</b>: two players who enter the same passcode play each other. Both see their own castle at the bottom. From the 3rd person on, you watch. If the first player leaves the screen, the match pauses.",
  "<b>用暗號對戰</b>：輸入相同暗號的2人對戰。雙方都會看到自己的城在下方。第3個人開始為觀戰。先進入的人離開畫面的話，比賽會暫停。",
  "<b>암호로 대전</b>: 같은 암호를 입력한 2명이 대전. 둘 다 자기 성이 아래에 보여요. 3번째 사람부터는 관전. 먼저 들어온 사람이 화면을 벗어나면 경기가 멈춰요."
 ],
 "ex_code": [
  "例：さくがえ123",
  "e.g. fence123",
  "例：fence123",
  "예: fence123"
 ],
 "online_hint2": [
  "同じあいことばを入れた人と対戦します。3人目からは観戦になります。",
  "Play against whoever enters the same passcode. From the 3rd person on, you watch.",
  "和輸入相同暗號的人對戰。第3個人開始為觀戰。",
  "같은 암호를 입력한 사람과 대전해요. 3번째 사람부터는 관전이 됩니다."
 ],
 "opp": [
  "相手",
  "Rival",
  "對手",
  "상대"
 ],
 "cpu_lv": [
  "CPU（{lv}）",
  "CPU ({lv})",
  "CPU（{lv}）",
  "CPU ({lv})"
 ],
 "soon_start": [
  "まもなく スタート！ {n}",
  "Starting soon! {n}",
  "即將開始！ {n}",
  "곧 시작! {n}"
 ],
 "swap_pending": [
  "{who}の入れかえ！ 光る2列が あと{n}秒で入れかわる",
  "{who} swaps! The 2 glowing rows swap in {n}s",
  "{who}的互換！ 發光的2排 {n}秒後互換",
  "{who}의 체인지! 빛나는 2줄이 {n}초 후 바뀐다"
 ],
 "swap_both": [
  "入れかえできる！ 自分の列と相手の列をタップ",
  "Swap now! Tap your row and a rival row",
  "可以互換！ 點自己的一排和對手的一排",
  "체인지 가능! 내 줄과 상대 줄을 탭"
 ],
 "swap_mine": [
  "自分の列をえらんでね",
  "Pick one of your rows",
  "請選自己的一排",
  "내 줄을 골라 줘"
 ],
 "swap_opp": [
  "相手の列をえらんでね",
  "Pick a rival row",
  "請選對手的一排",
  "상대 줄을 골라 줘"
 ],
 "secs_left": [
  "（あと{n}秒）",
  " ({n}s left)",
  "（剩{n}秒）",
  " ({n}초 남음)"
 ],
 "opp_aiming": [
  "{who}が、入れかえをねらっている…",
  "{who} is planning a swap…",
  "{who}正在盤算互換…",
  "{who}, 체인지를 노리는 중…"
 ],
 "swap_soon": [
  "まもなく {who}の入れかえの番！ あと{n}秒",
  "{who}'s swap turn soon! {n}s",
  "{who}的互換回合快到了！ 剩{n}秒",
  "곧 {who}의 체인지 차례! {n}초"
 ],
 "swap_next": [
  "つぎの入れかえまで {n}秒（{who}の番）",
  "Next swap in {n}s ({who})",
  "距離下次互換 {n}秒（{who}）",
  "다음 체인지까지 {n}초 ({who} 차례)"
 ],
 "swap_prep": [
  "入れかえの準備中…",
  "Swap in progress…",
  "互換準備中…",
  "체인지 준비 중…"
 ],
 "swap_no": [
  "いまは入れかえできません",
  "You can't swap right now",
  "現在不能互換",
  "지금은 체인지할 수 없어요"
 ],
 "fence_mine": [
  "柵を置けるのは、自分の陣地（下半分）だけ",
  "You can only place fences on your side (bottom half)",
  "只能在自己的陣地（下半部）放柵欄",
  "울타리는 내 진영(아래 절반)에만 놓을 수 있어요"
 ],
 "full_row": [
  "1列まるごとは ふさげない（1マスはあける）",
  "Can't block a whole row (leave 1 gap)",
  "不能把一整排堵住（要留1格）",
  "한 줄을 통째로 막을 순 없어요 (1칸은 비우기)"
 ],
 "rescue": [
  "おたすけ +1コイン",
  "Helper +1 coin",
  "救濟 +1金幣",
  "도움 +1코인"
 ],
 "opp_plan": [
  "相手が入れかえを予告！",
  "Rival announced a swap!",
  "對手預告要互換！",
  "상대가 체인지를 예고!"
 ],
 "nocoin": [
  "コインがたりない",
  "Not enough coins",
  "金幣不夠",
  "코인이 부족해요"
 ],
 "hit": [
  "ヒット！",
  "HIT!",
  "命中！",
  "히트!"
 ],
 "hurt": [
  "-1  +2コイン",
  "-1  +2 coins",
  "-1  +2金幣",
  "-1  +2코인"
 ],
 "res_win": [
  "かち！",
  "YOU WIN!",
  "贏了！",
  "승리!"
 ],
 "res_lose": [
  "まけ…",
  "You lose…",
  "輸了…",
  "패배…"
 ],
 "res_draw": [
  "ひきわけ",
  "Draw",
  "平手",
  "무승부"
 ],
 "x_wins": [
  "{name}の勝ち！",
  "{name} wins!",
  "{name}贏了！",
  "{name} 승리!"
 ],
 "hp_left": [
  "のこりHP　{a} {x} － {y} {b}　（{t}秒）",
  "HP left: {a} {x} – {y} {b} ({t}s)",
  "剩餘HP　{a} {x} － {y} {b}　（{t}秒）",
  "남은 HP  {a} {x} - {y} {b}  ({t}초)"
 ],
 "nth_win": [
  "この強さに {n}勝目",
  "Win #{n} at this level",
  "在這個難度第{n}勝",
  "이 난이도에서 {n}승째"
 ],
 "x_left": [
  "{name}が退室しました",
  "{name} left",
  "{name}已離開",
  "{name}님이 퇴장했어요"
 ]
};
  function pick() {
    try { var q = new URLSearchParams(location.search).get('lang'); if (q && LANGS.indexOf(q) >= 0) { try { localStorage.setItem(KEY, q); } catch (e) {} return q; } } catch (e) {}
    try { var s = localStorage.getItem(KEY); if (s && LANGS.indexOf(s) >= 0) return s; } catch (e) {}
    var n = (navigator.language || 'ja').toLowerCase();
    if (n.indexOf('ja') === 0) return 'ja'; if (n.indexOf('ko') === 0) return 'ko'; if (n.indexOf('zh') === 0) return 'zh'; return 'en';
  }
  var L = pick();
  function t(k, v) {
    var row = D[k]; var i = LANGS.indexOf(L);
    var s = row ? (row[i] != null ? row[i] : row[0]) : k;
    if (v) for (var x in v) s = s.split('{' + x + '}').join(v[x]);
    return s;
  }
  function koFont() {
    if (L !== 'ko' || document.getElementById('ko-font')) return;
    var l = document.createElement('link'); l.id = 'ko-font'; l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Black+Han+Sans&display=swap'; document.head.appendChild(l);
  }
  function apply() {
    koFont();
    var de = document.documentElement;
    de.lang = L === 'zh' ? 'zh-Hant' : L; de.setAttribute('data-lang', L);
    document.querySelectorAll('[data-i]').forEach(function (e) { e.textContent = t(e.dataset.i); });
    document.querySelectorAll('[data-ih]').forEach(function (e) { e.innerHTML = t(e.dataset.ih); });
    document.querySelectorAll('[data-ip]').forEach(function (e) { e.placeholder = t(e.dataset.ip); });
    document.querySelectorAll('[data-ia]').forEach(function (e) { e.setAttribute('aria-label', t(e.dataset.ia)); });
    document.querySelectorAll('.langs button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.lang === L ? 'true' : 'false'); });
    document.title = t('doc_title');
    var md = document.querySelector('meta[name="description"]'); if (md) md.setAttribute('content', t('doc_desc'));
    try { document.dispatchEvent(new CustomEvent('langchange', { detail: L })); } catch (e) {}
  }
  function set(l) { if (LANGS.indexOf(l) < 0) return; L = l; try { localStorage.setItem(KEY, l); } catch (e) {} apply(); }
  function bind() {
    document.querySelectorAll('.langs button').forEach(function (b) { b.addEventListener('click', function () { set(b.dataset.lang); }); });
    apply();
  }
  window.I18N = { t: t, set: set, apply: apply, get lang() { return L; } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind); else bind();
})();
