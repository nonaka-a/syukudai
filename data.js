// モンスター画像のスプライトシートURL
const SPRITESHEET_IMAGE_URL = 'spritesheet.png';

// --- スプライトシートのJSONデータ（アトラス）を自動生成 ---
const ATLAS_COLUMNS = 10;
const ATLAS_ROWS = 5;
const SPRITE_WIDTH = 400;
const SPRITE_HEIGHT = 400;
const totalMonsters = ATLAS_ROWS * ATLAS_COLUMNS;
const frames = {};

for (let i = 0; i < totalMonsters; i++) {
    const monsterId = i + 1; // IDを1から開始
    const row = Math.floor(i / ATLAS_COLUMNS);
    const col = i % ATLAS_COLUMNS;
    frames[`monster_${monsterId}.png`] = {
        frame: { x: col * SPRITE_WIDTH, y: row * SPRITE_HEIGHT, w: SPRITE_WIDTH, h: SPRITE_HEIGHT },
        sourceSize: { w: SPRITE_WIDTH, h: SPRITE_HEIGHT }
    };
}

const SPRITESHEET_ATLAS = {
    frames: frames,
    meta: {
        size: { w: ATLAS_COLUMNS * SPRITE_WIDTH, h: ATLAS_ROWS * SPRITE_HEIGHT }
    }
};

// --- モンスターデータの元データ（IDと画像ファイル名は自動で付与） ---
const MONSTERS_DATA_RAW = [
    { name: 'とげまい', maxHp: 50, description: 'いたずらがだいすき。\n今日も何かいたずらすることが ないかたくらんでいる。', background: 'field_day.png' },
    { name: 'カニ', maxHp: 60, description: 'はまべをよこぎる かに。\nとにかくはやい。', background: 'beach.png' },
    { name: 'きんにくマッチョ', maxHp: 100, description: '「モンスターじゃないぞ！」ともんくをいっている。\nみなみの島のつよいマッチョ。', background: 'field_day.png' },
    { name: 'ボスとげまい', maxHp: 120, description: 'とげまいたちの中でも大きなとげまい。\nトゲトゲにさわるといたい。', background: 'field_day.png' },
    { name: 'うみとげまい', maxHp: 130, description: 'うみのなかをおよぐとけまい。\nゴーグルがおきにいり。', background: 'beach.png' },
    { name: 'ボスマッチョ', maxHp: 140, description: '「おれもモンスターじゃないぞ！」とさけんでる。\nとっしんがつよい。', background: 'cave.png' },
    { name: 'とげマッチョ', maxHp: 150, description: 'とげまいがマッチョになったすがた。\nジャンプこうげきしてくる。', background: 'cave.png' },
    { name: 'たしざんざん', maxHp: 60, description: 'たしざんが好きなモンスター。\nたたかれるとけっこういたい。', background: 'field_day.png' },
    { name: 'ひきひき', maxHp: 70, description: 'ひきざんをだしてくるモンスター。\nおとなしいせいかく。', background: 'field_day.png' },
    { name: 'かけざんかいじゅう', maxHp: 80, description: '九九がとくい。あるくのはけっこうゆっくりだから、あせらなくてもだいじょうぶ。', background: 'field_day.png' },

    { name: 'わりむし', maxHp: 90, description: 'そら飛ぶわりざんがすきなむし。\nじーっとこっちを見つめてくる。', background: 'field_day.png' },
    { name: 'えもじスライム', maxHp: 100, description: 'いろんな絵文字がだいすき。\nあとたべるのもだいすき。', background: 'field_day.png' },
    { name: 'もんだいカー', maxHp: 110, description: 'たくさんのもんだいをつんでいる車。\nつみすぎで重くてゆっくりしか走れない。', background: 'field_day.png' },
    { name: 'すうじのまほう本', maxHp: 65, description: 'すうじのもんだいがたくさんつまった本。\n今日のもんだいは？', background: 'castle.png' },
    { name: 'ひらがなのまほう本', maxHp: 85, description: 'こくごの本。今日はどのおはなしをおんどくしよう？', background: 'castle.png' },
    { name: 'えいごのまほう本', maxHp: 115, description: 'Hello, I am an English book. Nice to meet you!', background: 'castle.png' },
    { name: 'てきとけい', maxHp: 100, description: '何時かわからないへんてこなとけい。\nねえねえ、今なんじ…？', background: 'castle.png' },
    { name: 'ムーリックキューブ', maxHp: 110, description: '色がおおすぎてそろえられないルービックキューブ。', background: 'castle.png' },
    { name: 'こっぷっぷ', maxHp: 60, description: 'にらめっこが好きなコップ。わらうとまけよ、あっぷっぷ。', background: 'field_day.png' },
    { name: 'ふらいぱん', maxHp: 100, description: '空とぶフライパン。パタパタとんで、どこまでいくの？', background: 'field_night.png' },

    { name: 'オヤリョーシカ', maxHp: 120, description: 'いちばん大きなマトリョーシカ。\nこどもやまごが中にかくれているかも。', background: 'field_day.png' },
    { name: 'コリョーシカ', maxHp: 100, description: 'こどものマトリョーシカ。\nはやくおやより大きくなりたい。', background: 'field_day.png' },
    { name: 'マゴリョーシカ', maxHp: 80, description: 'まごのマトリョーシカ。\nさいきんはサッカーがすきみたい。。', background: 'field_day.png' },
    { name: 'ヒマゴリョーシカ', maxHp: 60, description: 'ひまごのマトリョーシカ。\nあれ？たったままねちゃってる。', background: 'field_day.png' },
    { name: 'うそ月', maxHp: 80, description: 'うそばっかり言う月。\nうそ月のいうことはしんじちゃダメだよ', background: 'field_night.png' },
    { name: 'もち月', maxHp: 80, description: 'うさぎにまかせないで、じぶんでもちつきする月。\nぺったん、ぺったん', background: 'field_night.png' },
    { name: 'あたり月', maxHp: 100, description: 'あたりが出たらもう１月プレゼント。\nかったお店にもっていってね。', background: 'field_night.png' },
    { name: 'だれかのタマゴ', maxHp: 100, description: 'なんのタマゴかわからない。\nずーっとタマゴのままのタマゴ。', background: 'cave.png' },
    { name: 'パーキング', maxHp: 110, description: 'じゃんけんのパーの王さま。車にのるのが大好き。', background: 'field_day.png' },
    { name: 'すまほうつかい', maxHp: 90, description: 'まほうがつかえるスマホ。\nまほうのちからではなれた人とおはなしできちゃう。', background: 'field_night.png' },

    { name: 'ギャクパンダ', maxHp: 100, description: '白黒がはんたいのパンダ。\nなんだかあまりかわいくないぞ。', background: 'field_day.png' },
    { name: 'はやかめ', maxHp: 80, description: 'かめなのに走るのがとってもはやい。\nきょうそうではまけたことがない。', background: 'beach.png' },
    { name: 'あかうんち', maxHp: 70, description: 'やる気いっぱい元気いっぱいのあかいうんち。\n火がぼうぼうであちち！', background: 'castle.png' },
    { name: 'みどりうんち', maxHp: 60, description: 'こころやさしいみどりいろ。\nでもはっぱでこうげきしてくる。', background: 'field_day.png' },
    { name: 'きんのうんち', maxHp: 110, description: 'お金もちのうんち。\nでも、うんちだからお金はつかわないんだって。', background: 'field_day.png' },
    { name: 'でかうんち', maxHp: 120, description: 'おおきなうんち。\nこれでおなかもスッキリ？', background: 'field_day.png' },
    { name: 'マッチョうんち', maxHp: 140, description: 'カチコチのマッチョうんち。まいにちきんトレをかかさない。', background: 'field_day.png' },
    { name: 'ばけバケツ', maxHp: 80, description: 'バケツのおばけ。はずかしがりやで、かおを見た人はほとんどいない。。', background: 'field_night.png' },
    { name: 'とうめいモンスター', maxHp: 110, description: '見えないけどいるよ。とうめいなんだ。\nほんとだよ。', background: 'field_night.png' },
    { name: 'ニセまい', maxHp: 110, description: 'あかまいまいのふりをしたたニセモノ。\nあなたはだあれ？', background: 'field_day.png' },

    { name: 'きんぎょぎょ', maxHp: 80, description: 'びっくりしてるきんぎょ。\nぎょぎょ！何を見たんだろう？', background: 'beach.png' },
    { name: 'シャークリ', maxHp: 100, description: 'しゃっくりがとまらないサメ。\nヒックヒックいっててつらそう…', background: 'beach.png' },
    { name: 'ラスボスとけまい', maxHp: 180, description: 'とげまいたちの中でいちばんえらいとげまい。\nとても大きくてつよい。', background: 'field_night.png' },
    { name: 'さんすうかいじゅう', maxHp: 190, description: 'さんすうがとってもとくい。くちから火をだせる', background: 'castle.png' },
    { name: 'おおおばけけけ', maxHp: 200, description: 'でっかいでっかいおばけ。\n「ケケケ」とわらう。', background: 'field_night.png' },
    { name: 'ゴーレム', maxHp:210, description: 'どうくつのまもりがみ。\nとってもかたくて、がんじょう。', background: 'cave.png' },
    { name: 'ドラゴン', maxHp: 220, description: 'そらとぶドラゴン。\n口から火をふくことができる。', background: 'field_night.png' },
    { name: 'デーモン', maxHp: 230, description: 'わるいアクマ。\nつかまったらきみもアクマにされちゃうぞ。', background: 'castle.png' },
    { name: 'うみぼうず', maxHp: 240, description: 'うみのかみさま。\nとっても大きくてうみであそぶのが大好き。', background: 'beach.png' },
    { name: 'しゅくだいまおう', maxHp: 250, description: 'すべてのしゅくだいのおおもと。さいごにしてさいきょうのてき。コンプリートおめでとう！', background: 'castle.png' },
];

// --- 元データにIDと画像ファイル名を付与して最終的なモンスターデータを作成 ---
const MONSTERS_DATA = MONSTERS_DATA_RAW.map((monster, index) => ({
    id: index + 1, // IDを1から開始
    name: monster.name,
    maxHp: monster.maxHp,
    description: monster.description,
    image: `monster_${index + 1}.png`,
    background: monster.background
}));