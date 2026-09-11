import React, { useState, useMemo, useEffect } from 'react';
import {
  Smile,
  X,
  Search,
  Clock,
  Sparkles,
  Laptop,
  FileText,
  AlertCircle,
  ArrowRight,
  Bookmark,
  Image as ImageIcon,
} from 'lucide-react';

interface EmojiIconPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertEmoji: (emoji: string) => void;
}

interface EmojiItem {
  char: string;
  name: string;
  keywords: string[];
  category: string;
}

const EMOJI_CATEGORIES = [
  { id: 'popular', label: 'Popular', icon: Sparkles },
  { id: 'tech', label: 'Tech & Dev', icon: Laptop },
  { id: 'work', label: 'Docs & Work', icon: FileText },
  { id: 'smileys', label: 'Smileys', icon: Smile },
  { id: 'status', label: 'Status & Badges', icon: AlertCircle },
  { id: 'arrows', label: 'Arrows', icon: ArrowRight },
  { id: 'callouts', label: 'GFM Callouts', icon: Bookmark },
  { id: 'icons', label: 'Material Icons', icon: ImageIcon },
];

const MATERIAL_ICONS: { name: string; label: string; keywords: string[] }[] = [
  { name: 'crown', label: 'Crown', keywords: ['king', 'leader', 'royal', 'vip'] },
  { name: 'favorite', label: 'Heart', keywords: ['love', 'like', 'favorite', 'health'] },
  { name: 'star', label: 'Star', keywords: ['favorite', 'rating', 'feature'] },
  { name: 'bolt', label: 'Lightning', keywords: ['fast', 'speed', 'power', 'energy'] },
  { name: 'rocket_launch', label: 'Rocket', keywords: ['launch', 'startup', 'deploy'] },
  { name: 'local_fire_department', label: 'Fire', keywords: ['hot', 'trend', 'flame', 'popular'] },
  { name: 'check_circle', label: 'Check Circle', keywords: ['done', 'success', 'complete', 'ok'] },
  { name: 'cancel', label: 'Cancel', keywords: ['close', 'cancel', 'error', 'fail'] },
  { name: 'warning', label: 'Warning', keywords: ['alert', 'caution', 'danger'] },
  { name: 'info', label: 'Info', keywords: ['information', 'help', 'details'] },
  { name: 'help', label: 'Help', keywords: ['help', 'faq', 'ask', 'question'] },
  { name: 'lightbulb', label: 'Lightbulb', keywords: ['idea', 'tip', 'solution'] },
  { name: 'lock', label: 'Lock', keywords: ['security', 'password', 'encrypt', 'private'] },
  { name: 'lock_open', label: 'Unlock', keywords: ['open', 'access', 'decrypt'] },
  { name: 'key', label: 'Key', keywords: ['auth', 'token', 'secret', 'access'] },
  { name: 'shield', label: 'Shield', keywords: ['security', 'protect', 'defense'] },
  { name: 'code', label: 'Code', keywords: ['programming', 'developer', 'script'] },
  { name: 'terminal', label: 'Terminal', keywords: ['console', 'cli', 'command'] },
  { name: 'storage', label: 'Database', keywords: ['storage', 'data', 'sql', 'backend'] },
  { name: 'dns', label: 'Server', keywords: ['hosting', 'backend', 'infrastructure'] },
  { name: 'cloud', label: 'Cloud', keywords: ['aws', 'hosting', 'online', 'sync'] },
  { name: 'cloud_upload', label: 'Cloud Upload', keywords: ['upload', 'backup', 'sync'] },
  { name: 'cloud_download', label: 'Cloud Download', keywords: ['download', 'backup'] },
  { name: 'language', label: 'Globe', keywords: ['world', 'web', 'internet', 'url'] },
  { name: 'link', label: 'Link', keywords: ['url', 'chain', 'hyperlink', 'href'] },
  { name: 'attach_file', label: 'Paperclip', keywords: ['attachment', 'file', 'include'] },
  { name: 'image', label: 'Image', keywords: ['picture', 'photo', 'media'] },
  { name: 'movie', label: 'Film', keywords: ['video', 'movie', 'media'] },
  { name: 'music_note', label: 'Music', keywords: ['audio', 'sound', 'song'] },
  { name: 'description', label: 'File', keywords: ['document', 'page', 'paper'] },
  { name: 'article', label: 'File Text', keywords: ['document', 'text', 'note'] },
  { name: 'folder', label: 'Folder', keywords: ['directory', 'files', 'storage'] },
  { name: 'folder_open', label: 'Folder Open', keywords: ['directory', 'browse'] },
  { name: 'calendar_month', label: 'Calendar', keywords: ['date', 'schedule', 'event'] },
  { name: 'schedule', label: 'Clock', keywords: ['time', 'schedule', 'deadline'] },
  { name: 'notifications', label: 'Bell', keywords: ['notification', 'alert', 'reminder'] },
  { name: 'label', label: 'Tag', keywords: ['label', 'category', 'badge'] },
  { name: 'bookmark', label: 'Bookmark', keywords: ['save', 'mark', 'favorite'] },
  { name: 'push_pin', label: 'Pushpin', keywords: ['pin', 'note', 'important'] },
  { name: 'search', label: 'Search', keywords: ['find', 'lookup', 'inspect'] },
  { name: 'settings', label: 'Settings', keywords: ['config', 'options', 'gear'] },
  { name: 'build', label: 'Wrench', keywords: ['tool', 'fix', 'repair'] },
  { name: 'handyman', label: 'Hammer', keywords: ['build', 'tool', 'construct'] },
  { name: 'format_paint', label: 'Paintbrush', keywords: ['art', 'design', 'color', 'style'] },
  { name: 'palette', label: 'Palette', keywords: ['art', 'theme', 'color'] },
  { name: 'photo_camera', label: 'Camera', keywords: ['photo', 'picture', 'capture'] },
  { name: 'campaign', label: 'Megaphone', keywords: ['announce', 'broadcast', 'news'] },
  { name: 'emoji_events', label: 'Trophy', keywords: ['winner', 'award', 'achievement'] },
  { name: 'military_tech', label: 'Medal', keywords: ['winner', 'prize', 'award'] },
  { name: 'flag', label: 'Flag', keywords: ['report', 'mark', 'country'] },
  { name: 'gps_fixed', label: 'Crosshairs', keywords: ['target', 'focus', 'precision'] },
  { name: 'bar_chart', label: 'Bar Chart', keywords: ['stats', 'analytics', 'graph'] },
  { name: 'show_chart', label: 'Line Chart', keywords: ['stats', 'growth', 'trend'] },
  { name: 'pie_chart', label: 'Pie Chart', keywords: ['stats', 'percentage', 'data'] },
  { name: 'refresh', label: 'Refresh', keywords: ['reload', 'sync', 'update'] },
  { name: 'undo', label: 'Undo', keywords: ['revert', 'back', 'previous'] },
  { name: 'redo', label: 'Redo', keywords: ['forward', 'next'] },
  { name: 'download', label: 'Download', keywords: ['save', 'export', 'get'] },
  { name: 'upload', label: 'Upload', keywords: ['send', 'import', 'push'] },
  { name: 'share', label: 'Share', keywords: ['send', 'distribute', 'social'] },
  { name: 'content_copy', label: 'Copy', keywords: ['duplicate', 'clone', 'paste'] },
  { name: 'content_cut', label: 'Scissors', keywords: ['cut', 'trim', 'clip'] },
  { name: 'delete', label: 'Trash', keywords: ['delete', 'remove', 'bin'] },
  { name: 'edit', label: 'Pen', keywords: ['edit', 'write', 'draw'] },
  { name: 'draw', label: 'Pencil', keywords: ['edit', 'write', 'draft'] },
  { name: 'eraser', label: 'Eraser', keywords: ['delete', 'remove', 'clear'] },
  { name: 'person', label: 'User', keywords: ['person', 'account', 'profile'] },
  { name: 'group', label: 'Users', keywords: ['people', 'team', 'group'] },
  { name: 'handshake', label: 'Handshake', keywords: ['deal', 'agreement', 'partner'] },
  { name: 'mail', label: 'Envelope', keywords: ['email', 'mail', 'message'] },
  { name: 'chat', label: 'Comment', keywords: ['chat', 'message', 'discuss'] },
  { name: 'forum', label: 'Forum', keywords: ['discussion', 'community', 'board'] },
  { name: 'sms', label: 'Message', keywords: ['chat', 'text', 'sms'] },
  { name: 'phone', label: 'Phone', keywords: ['call', 'contact', 'mobile'] },
  { name: 'location_on', label: 'Map Pin', keywords: ['location', 'place', 'gps'] },
  { name: 'home', label: 'Home', keywords: ['house', 'building', 'shelter'] },
  { name: 'apartment', label: 'Building', keywords: ['office', 'company', 'work'] },
  { name: 'storefront', label: 'Store', keywords: ['shop', 'market', 'buy'] },
  { name: 'shopping_cart', label: 'Cart', keywords: ['buy', 'purchase', 'shop'] },
  { name: 'credit_card', label: 'Credit Card', keywords: ['payment', 'money', 'finance'] },
  { name: 'payments', label: 'Money', keywords: ['cash', 'payment', 'finance'] },
  { name: 'diamond', label: 'Gem', keywords: ['diamond', 'precious', 'valuable'] },
  { name: 'psychology', label: 'Brain', keywords: ['ai', 'intelligence', 'think'] },
  { name: 'smart_toy', label: 'Robot', keywords: ['bot', 'ai', 'automation'] },
  { name: 'auto_awesome', label: 'Magic Wand', keywords: ['magic', 'sparkle', 'ai', 'generate'] },
  { name: 'science', label: 'Flask', keywords: ['experiment', 'science', 'lab'] },
  { name: 'bug_report', label: 'Bug', keywords: ['issue', 'error', 'debug', 'defect'] },
  { name: 'account_tree', label: 'Diagram', keywords: ['flowchart', 'chart', 'structure'] },
  { name: 'layers', label: 'Layers', keywords: ['layers', 'stack', 'group'] },
  { name: 'inventory_2', label: 'Boxes', keywords: ['packages', 'modules', 'components'] },
  { name: 'extension', label: 'Puzzle', keywords: ['plugin', 'addon', 'extension'] },
  { name: 'power', label: 'Power', keywords: ['shutdown', 'turn off', 'stop'] },
  { name: 'play_arrow', label: 'Play', keywords: ['start', 'run', 'begin'] },
  { name: 'pause', label: 'Pause', keywords: ['stop', 'wait', 'hold'] },
  { name: 'stop', label: 'Stop', keywords: ['halt', 'end', 'block'] },
  { name: 'skip_next', label: 'Skip Next', keywords: ['next', 'skip', 'forward'] },
  { name: 'skip_previous', label: 'Skip Previous', keywords: ['previous', 'rewind'] },
  { name: 'wifi', label: 'Wi-Fi', keywords: ['wireless', 'internet', 'network'] },
  { name: 'signal_cellular_alt', label: 'Signal', keywords: ['network', 'connection', 'strength'] },
  { name: 'dns', label: 'DNS', keywords: ['server', 'hosting', 'backend'] },
  { name: 'memory', label: 'Memory', keywords: ['ram', 'hardware', 'chip'] },
  { name: 'developer_board', label: 'Circuit Board', keywords: ['hardware', 'electronics', 'chip'] },
  { name: 'rocket', label: 'Rocket', keywords: ['space', 'launch', 'fast'] },
  { name: 'satellite_alt', label: 'Satellite', keywords: ['signal', 'broadcast', 'space'] },
  { name: 'visibility', label: 'Visibility', keywords: ['eye', 'view', 'show', 'preview'] },
  { name: 'visibility_off', label: 'Visibility Off', keywords: ['hide', 'hidden', 'invisible'] },
  { name: 'toggle_on', label: 'Toggle On', keywords: ['switch', 'enable', 'on'] },
  { name: 'toggle_off', label: 'Toggle Off', keywords: ['switch', 'disable', 'off'] },
  { name: 'filter_list', label: 'Filter', keywords: ['sort', 'filter', 'organize'] },
  { name: 'sort', label: 'Sort', keywords: ['order', 'arrange', 'sort'] },
  { name: 'calendar_today', label: 'Today', keywords: ['date', 'today', 'now'] },
  { name: 'event', label: 'Event', keywords: ['calendar', 'meeting', 'schedule'] },
  { name: 'timer', label: 'Timer', keywords: ['time', 'stopwatch', 'countdown'] },
  { name: 'alarm', label: 'Alarm', keywords: ['wake', 'alert', 'reminder'] },
  { name: 'maps_home_work', label: 'Map', keywords: ['location', 'place', 'navigate'] },
  { name: 'directions', label: 'Directions', keywords: ['navigate', 'route', 'path'] },
  { name: 'workspace_premium', label: 'Workspace Premium', keywords: ['badge', 'certified', 'quality'] },
  { name: 'gpp_good', label: 'Security', keywords: ['shield', 'secure', 'verified'] },
  { name: 'verified', label: 'Verified', keywords: ['check', 'confirmed', 'authentic'] },
  { name: 'new_releases', label: 'New', keywords: ['new', 'fresh', 'latest', 'release'] },
  { name: 'trending_up', label: 'Trending Up', keywords: ['growth', 'increase', 'up'] },
  { name: 'trending_down', label: 'Trending Down', keywords: ['decrease', 'down', 'decline'] },
  { name: 'analytics', label: 'Analytics', keywords: ['stats', 'data', 'insights'] },
  { name: 'insights', label: 'Insights', keywords: ['analytics', 'data', 'understand'] },
  { name: 'hub', label: 'Hub', keywords: ['center', 'network', 'connect'] },
  { name: 'cloud_sync', label: 'Cloud Sync', keywords: ['sync', 'cloud', 'update'] },
  { name: 'backup', label: 'Backup', keywords: ['save', 'copy', 'archive'] },
  { name: 'restore', label: 'Restore', keywords: ['recover', 'revert', 'undo'] },
  { name: 'history', label: 'History', keywords: ['time', 'past', 'previous', 'log'] },
  { name: 'schedule_send', label: 'Scheduled', keywords: ['time', 'delay', 'future'] },
  { name: 'mark_email_read', label: 'Read', keywords: ['email', 'read', 'seen'] },
  { name: 'inbox', label: 'Inbox', keywords: ['email', 'receive', 'mail'] },
  { name: 'outbox', label: 'Outbox', keywords: ['email', 'send', 'mail'] },
  { name: 'draft', label: 'Draft', keywords: ['email', 'compose', 'write'] },
  { name: 'send', label: 'Send', keywords: ['email', 'message', 'submit'] },
  { name: 'quickreply', label: 'Quick Reply', keywords: ['reply', 'response', 'fast'] },
  { name: 'markunread', label: 'Unread', keywords: ['email', 'unread', 'new'] },
  { name: 'attach_money', label: 'Money Attach', keywords: ['finance', 'payment', 'dollar'] },
  { name: 'savings', label: 'Savings', keywords: ['money', 'bank', 'save'] },
  { name: 'account_balance', label: 'Account Balance', keywords: ['bank', 'finance', 'money'] },
  { name: 'request_quote', label: 'Quote', keywords: ['price', 'estimate', 'cost'] },
  { name: 'price_check', label: 'Price Check', keywords: ['price', 'cost', 'check'] },
];

interface MaterialIcon {
  char: string;
  name: string;
  keywords: string[];
  category: string;
  isMaterialIcon: true;
}

const MATERIAL_DATABASE: MaterialIcon[] = MATERIAL_ICONS.map((ic) => ({
  char: `<span class="material-symbols-outlined">${ic.name}</span>`,
  name: ic.label,
  keywords: ic.keywords,
  category: 'icons',
  isMaterialIcon: true,
}));

const EMOJI_DATABASE: EmojiItem[] = [
  // Popular / High-frequency Markdown emojis
  { char: '🚀', name: 'Rocket', keywords: ['launch', 'fast', 'deploy', 'space', 'ship'], category: 'popular' },
  { char: '⚡', name: 'Lightning', keywords: ['fast', 'speed', 'thunder', 'power', 'quick'], category: 'popular' },
  { char: '💡', name: 'Light bulb', keywords: ['idea', 'tip', 'smart', 'thought', 'solution'], category: 'popular' },
  { char: '🔥', name: 'Fire', keywords: ['hot', 'trend', 'flame', 'burn', 'awesome'], category: 'popular' },
  { char: '✨', name: 'Sparkles', keywords: ['magic', 'new', 'star', 'shine', 'clean'], category: 'popular' },
  { char: '📌', name: 'Pushpin', keywords: ['pin', 'note', 'important', 'mark', 'sticky'], category: 'popular' },
  { char: '✅', name: 'Check mark button', keywords: ['done', 'yes', 'ok', 'pass', 'complete', 'success'], category: 'popular' },
  { char: '❌', name: 'Cross mark', keywords: ['no', 'fail', 'cancel', 'error', 'wrong', 'delete'], category: 'popular' },
  { char: '⚠️', name: 'Warning', keywords: ['alert', 'caution', 'danger', 'notice'], category: 'popular' },
  { char: '📝', name: 'Memo', keywords: ['note', 'write', 'edit', 'document', 'pencil'], category: 'popular' },
  { char: '💻', name: 'Laptop', keywords: ['code', 'computer', 'developer', 'pc', 'work'], category: 'popular' },
  { char: '🎯', name: 'Bullseye', keywords: ['target', 'goal', 'hit', 'aim', 'focus'], category: 'popular' },
  { char: '📊', name: 'Bar chart', keywords: ['stats', 'analytics', 'data', 'graph', 'metrics'], category: 'popular' },
  { char: '🔍', name: 'Magnifying glass', keywords: ['search', 'find', 'lookup', 'inspect'], category: 'popular' },
  { char: '⚙️', name: 'Gear', keywords: ['settings', 'config', 'setup', 'options', 'tool'], category: 'popular' },
  { char: '🔒', name: 'Locked', keywords: ['security', 'protect', 'private', 'key', 'safe', 'encrypt'], category: 'popular' },
  { char: '📦', name: 'Package', keywords: ['box', 'module', 'npm', 'delivery', 'cargo', 'build'], category: 'popular' },
  { char: '🎨', name: 'Palette', keywords: ['art', 'theme', 'color', 'style', 'design'], category: 'popular' },
  { char: '🏷️', name: 'Label', keywords: ['tag', 'category', 'badge', 'price'], category: 'popular' },
  { char: '🔗', name: 'Link', keywords: ['url', 'href', 'chain', 'connect', 'hyperlink'], category: 'popular' },
  { char: '📁', name: 'Folder', keywords: ['directory', 'files', 'storage', 'project'], category: 'popular' },
  { char: '📄', name: 'Page', keywords: ['document', 'text', 'paper', 'article'], category: 'popular' },
  { char: '🌐', name: 'Globe', keywords: ['world', 'web', 'internet', 'network', 'url', 'online'], category: 'popular' },
  { char: '🔔', name: 'Bell', keywords: ['notification', 'alert', 'reminder', 'sound'], category: 'popular' },
  { char: '💬', name: 'Speech balloon', keywords: ['chat', 'comment', 'message', 'discussion'], category: 'popular' },
  { char: '🧪', name: 'Test tube', keywords: ['experiment', 'science', 'qa', 'testing', 'lab'], category: 'popular' },
  { char: '📈', name: 'Chart increasing', keywords: ['growth', 'profit', 'up', 'metric', 'gain'], category: 'popular' },
  { char: '💎', name: 'Gem stone', keywords: ['diamond', 'valuable', 'ruby', 'precious', 'quality'], category: 'popular' },
  { char: '⏳', name: 'Hourglass', keywords: ['time', 'wait', 'clock', 'loading', 'pending'], category: 'popular' },
  { char: '🏆', name: 'Trophy', keywords: ['winner', 'award', 'first', 'success', 'prize'], category: 'popular' },

  // Tech & Dev
  { char: '🖥️', name: 'Desktop computer', keywords: ['monitor', 'screen', 'pc', 'hardware'], category: 'tech' },
  { char: '📱', name: 'Mobile phone', keywords: ['iphone', 'android', 'device', 'responsive'], category: 'tech' },
  { char: '⌨️', name: 'Keyboard', keywords: ['typing', 'shortcuts', 'input'], category: 'tech' },
  { char: '🖱️', name: 'Computer mouse', keywords: ['click', 'pointer', 'hardware'], category: 'tech' },
  { char: '🔌', name: 'Electric plug', keywords: ['plugin', 'connect', 'power', 'adapter'], category: 'tech' },
  { char: '🔋', name: 'Battery', keywords: ['energy', 'charge', 'power'], category: 'tech' },
  { char: '💾', name: 'Floppy disk', keywords: ['save', 'disk', 'storage', 'backup'], category: 'tech' },
  { char: '📡', name: 'Satellite antenna', keywords: ['signal', 'broadcast', 'network', 'wifi'], category: 'tech' },
  { char: '🤖', name: 'Robot', keywords: ['bot', 'ai', 'automation', 'llm', 'machine'], category: 'tech' },
  { char: '👾', name: 'Alien monster', keywords: ['game', 'arcade', 'retro', 'pixel'], category: 'tech' },
  { char: '🐛', name: 'Bug', keywords: ['issue', 'error', 'defect', 'debug', 'glitch'], category: 'tech' },
  { char: '🛠️', name: 'Hammer and wrench', keywords: ['tools', 'build', 'maintain', 'repair'], category: 'tech' },
  { char: '🔬', name: 'Microscope', keywords: ['inspect', 'audit', 'deep dive', 'science'], category: 'tech' },
  { char: '☁️', name: 'Cloud', keywords: ['server', 'aws', 'gcp', 'cloud run', 'online', 'sync'], category: 'tech' },
  { char: '🛡️', name: 'Shield', keywords: ['security', 'armor', 'defense', 'safe'], category: 'tech' },
  { char: '🔑', name: 'Key', keywords: ['auth', 'token', 'access', 'secret', 'password'], category: 'tech' },
  { char: '🧬', name: 'DNA', keywords: ['genetics', 'evolution', 'biology', 'data'], category: 'tech' },
  { char: '🧮', name: 'Abacus', keywords: ['math', 'calculate', 'count', 'algorithm'], category: 'tech' },
  { char: '⚛️', name: 'Atom symbol', keywords: ['react', 'nuclear', 'physics', 'core'], category: 'tech' },
  { char: '🐍', name: 'Snake', keywords: ['python', 'backend', 'code'], category: 'tech' },

  // Docs & Work
  { char: '📋', name: 'Clipboard', keywords: ['copy', 'paste', 'list', 'tasks', 'checklist'], category: 'work' },
  { char: '📑', name: 'Bookmark tabs', keywords: ['documents', 'pages', 'tabs', 'reference'], category: 'work' },
  { char: '📍', name: 'Round pushpin', keywords: ['location', 'place', 'pin', 'here'], category: 'work' },
  { char: '📎', name: 'Paperclip', keywords: ['attachment', 'file', 'link', 'include'], category: 'work' },
  { char: '📐', name: 'Triangular ruler', keywords: ['measure', 'math', 'geometry', 'design'], category: 'work' },
  { char: '📏', name: 'Straight ruler', keywords: ['measure', 'rule', 'length'], category: 'work' },
  { char: '📂', name: 'Open folder', keywords: ['directory', 'browse', 'files'], category: 'work' },
  { char: '🗂️', name: 'Card index dividers', keywords: ['archive', 'catalog', 'organize'], category: 'work' },
  { char: '📅', name: 'Calendar', keywords: ['date', 'schedule', 'plan', 'meeting'], category: 'work' },
  { char: '🗓️', name: 'Spiral calendar', keywords: ['agenda', 'event', 'timeline'], category: 'work' },
  { char: '⏰', name: 'Alarm clock', keywords: ['deadline', 'time', 'alert', 'due'], category: 'work' },
  { char: '⏱️', name: 'Stopwatch', keywords: ['benchmark', 'timer', 'performance'], category: 'work' },
  { char: '✉️', name: 'Envelope', keywords: ['mail', 'email', 'letter', 'contact'], category: 'work' },
  { char: '🔖', name: 'Bookmark', keywords: ['save', 'mark', 'favorite', 'tag'], category: 'work' },
  { char: '🔏', name: 'Pen and lock', keywords: ['sign', 'secure signature', 'private'], category: 'work' },

  // Smileys & People
  { char: '😀', name: 'Grinning face', keywords: ['smile', 'happy', 'joy'], category: 'smileys' },
  { char: '😄', name: 'Smiling face with open mouth', keywords: ['happy', 'laugh', 'pleased'], category: 'smileys' },
  { char: '😊', name: 'Smiling face with smiling eyes', keywords: ['blush', 'warm', 'friendly'], category: 'smileys' },
  { char: '😎', name: 'Smiling face with sunglasses', keywords: ['cool', 'confident', 'chill'], category: 'smileys' },
  { char: '🤩', name: 'Star-struck', keywords: ['excited', 'amazing', 'wow', 'fan'], category: 'smileys' },
  { char: '🥳', name: 'Partying face', keywords: ['celebrate', 'cheers', 'yay', 'party'], category: 'smileys' },
  { char: '🤔', name: 'Thinking face', keywords: ['consider', 'hmm', 'curious', 'wonder'], category: 'smileys' },
  { char: '🧐', name: 'Face with monocle', keywords: ['examine', 'inspect', 'curious', 'scholar'], category: 'smileys' },
  { char: '🤯', name: 'Exploding head', keywords: ['mind blown', 'shocked', 'unbelievable'], category: 'smileys' },
  { char: '🤝', name: 'Handshake', keywords: ['agreement', 'partner', 'deal', 'collaborate'], category: 'smileys' },
  { char: '🙌', name: 'Raising hands', keywords: ['celebrate', 'praise', 'hooray', 'cheer'], category: 'smileys' },
  { char: '👍', name: 'Thumbs up', keywords: ['approve', 'like', 'agree', 'good', '+1'], category: 'smileys' },
  { char: '👏', name: 'Clapping hands', keywords: ['applause', 'bravo', 'congrats'], category: 'smileys' },
  { char: '💪', name: 'Flexed biceps', keywords: ['strong', 'power', 'effort', 'grit'], category: 'smileys' },

  // Status & Badges
  { char: 'ℹ️', name: 'Information', keywords: ['info', 'faq', 'help', 'details'], category: 'status' },
  { char: '❓', name: 'Question mark', keywords: ['help', 'what', 'ask', 'query'], category: 'status' },
  { char: '❗', name: 'Exclamation mark', keywords: ['alert', 'attention', 'vital', 'note'], category: 'status' },
  { char: '💯', name: 'Hundred points', keywords: ['perfect', 'score', 'complete', '100'], category: 'status' },
  { char: '🟢', name: 'Green circle', keywords: ['online', 'active', 'good', 'success', 'running'], category: 'status' },
  { char: '🟡', name: 'Yellow circle', keywords: ['warning', 'idle', 'pending', 'standby'], category: 'status' },
  { char: '🔴', name: 'Red circle', keywords: ['offline', 'danger', 'stopped', 'error', 'failed'], category: 'status' },
  { char: '🔵', name: 'Blue circle', keywords: ['info', 'running', 'neutral'], category: 'status' },
  { char: '⭐', name: 'Star', keywords: ['favorite', 'rating', 'feature', 'top'], category: 'status' },
  { char: '🌟', name: 'Glowing star', keywords: ['highlight', 'special', 'shine'], category: 'status' },
  { char: '🛑', name: 'Stop sign', keywords: ['halt', 'blocker', 'danger', 'forbidden'], category: 'status' },
  { char: '🏁', name: 'Chequered flag', keywords: ['milestone', 'finish', 'end', 'goal'], category: 'status' },

  // Arrows
  { char: '➡️', name: 'Right arrow', keywords: ['forward', 'next', 'direction'], category: 'arrows' },
  { char: '⬅️', name: 'Left arrow', keywords: ['back', 'previous'], category: 'arrows' },
  { char: '⬆️', name: 'Up arrow', keywords: ['increase', 'top', 'above'], category: 'arrows' },
  { char: '⬇️', name: 'Down arrow', keywords: ['decrease', 'bottom', 'download'], category: 'arrows' },
  { char: '🔄', name: 'Counterclockwise arrows', keywords: ['refresh', 'sync', 'reload', 'repeat'], category: 'arrows' },
  { char: '🔀', name: 'Twisted rightwards arrows', keywords: ['shuffle', 'random'], category: 'arrows' },
  { char: '▶️', name: 'Play button', keywords: ['start', 'run', 'begin'], category: 'arrows' },
  { char: '⏭️', name: 'Next track', keywords: ['skip', 'forward'], category: 'arrows' },

  // Markdown Callout Alerts
  { char: '> [!NOTE]\n> ', name: 'Note Callout', keywords: ['note', 'info', 'callout', 'admonition'], category: 'callouts' },
  { char: '> [!TIP]\n> ', name: 'Tip Callout', keywords: ['tip', 'idea', 'hint', 'advice'], category: 'callouts' },
  { char: '> [!IMPORTANT]\n> ', name: 'Important Callout', keywords: ['important', 'vital', 'crucial'], category: 'callouts' },
  { char: '> [!WARNING]\n> ', name: 'Warning Callout', keywords: ['warning', 'alert', 'caution'], category: 'callouts' },
  { char: '> [!CAUTION]\n> ', name: 'Caution Callout', keywords: ['caution', 'danger', 'risk'], category: 'callouts' },
];

const RECENT_STORAGE_KEY = 'md_app_recent_emojis_v1';

export const EmojiIconPickerModal: React.FC<EmojiIconPickerModalProps> = ({
  isOpen,
  onClose,
  onInsertEmoji,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('popular');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [recentEmojis, setRecentEmojis] = useState<string[]>([]);

  // Load recently clicked emojis
  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_STORAGE_KEY);
      if (raw) {
        setRecentEmojis(JSON.parse(raw));
      }
    } catch {
      // Ignore
    }
  }, [isOpen]);

  const handleSelect = (emojiChar: string) => {
    onInsertEmoji(emojiChar);

    // Save to recents if not a callout
    if (!emojiChar.startsWith('>')) {
      const updated = [emojiChar, ...recentEmojis.filter((e) => e !== emojiChar)].slice(0, 14);
      setRecentEmojis(updated);
      try {
        localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignore
      }
    }

    onClose();
  };

  const filteredEmojis = useMemo(() => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const emojiResults = EMOJI_DATABASE.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.char.includes(q) ||
          item.keywords.some((k) => k.toLowerCase().includes(q))
      );
      const faResults = MATERIAL_DATABASE.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.keywords.some((k) => k.toLowerCase().includes(q))
      );
      return [...emojiResults, ...faResults];
    }
    if (activeCategory === 'icons') return MATERIAL_DATABASE;
    return EMOJI_DATABASE.filter((item) => item.category === activeCategory);
  }, [searchQuery, activeCategory]);

  if (!isOpen) return null;

  return (
    <div
      id="emoji-picker-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        id="emoji-picker-modal"
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-lg">
              <Smile size={16} />
            </div>
            <div>
              <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                Insert Emoji & Icons
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Search input */}
        <div className="p-3 border-b border-zinc-200 dark:border-zinc-800">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
            />
            <input
              id="emoji-search"
              name="emoji-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search emoji (e.g. rocket, star, warn, bug)..."
              autoFocus
              className="w-full pl-8 pr-8 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-blue-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Categories Bar */}
        {!searchQuery && (
          <div className="flex items-center gap-1 px-3 py-1.5 border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto text-[11px] bg-zinc-50/50 dark:bg-zinc-950/40 select-none">
            {EMOJI_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/70 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Icon size={12} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Main Grid Area */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {/* Recently used if any and no search active */}
          {!searchQuery && recentEmojis.length > 0 && activeCategory === 'popular' && (
            <div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-zinc-400 mb-2">
                <Clock size={11} />
                <span>RECENTLY USED</span>
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {recentEmojis.map((char, i) => {
                  const isHtml = char.startsWith('<img') || char.startsWith('<span');
                  return (
<button
                        key={`recent-${i}`}
                        type="button"
                        onClick={() => handleSelect(char)}
                        className="h-10 text-xl flex items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:scale-110 active:scale-95 transition-all"
                        {...(isHtml
                          ? { dangerouslySetInnerHTML: { __html: char } }
                          : { children: char })}
                      >
                      </button>
                  );
                })}
              </div>
              <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-3" />
            </div>
          )}

          {/* Callouts special category layout */}
          {activeCategory === 'callouts' && !searchQuery ? (
            <div className="space-y-2">
              <div className="text-[11px] text-zinc-500 mb-2">
                Click to insert official GitHub-flavored Markdown Callout admonition blocks:
              </div>
              {filteredEmojis.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelect(item.char)}
                  className="w-full text-left p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 hover:bg-blue-50/40 dark:hover:bg-zinc-800/60 transition-all flex items-center justify-between group"
                >
                  <div>
                    <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                      {item.name}
                    </div>
                    <code className="text-[10px] text-zinc-400 font-mono mt-0.5">
                      {item.char.replace('\n', ' ')}
                    </code>
                  </div>
                  <span className="text-[11px] font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    Insert
                  </span>
                </button>
              ))}
            </div>
          ) : (
            /* Standard Emoji / Icon Grid */
            <div>
              {filteredEmojis.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-400">
                  No matching emoji or icons found for &quot;{searchQuery}&quot;
                </div>
              ) : (
                <div className={`grid gap-1.5 ${activeCategory === 'icons' || (searchQuery && filteredEmojis.some(e => 'isMaterialIcon' in e && e.isMaterialIcon)) ? 'grid-cols-6' : 'grid-cols-7'}`}>
                  {filteredEmojis.map((item, idx) => {
                    const isMat = 'isMaterialIcon' in item && item.isMaterialIcon;
                    return (
                      <button
                        key={idx}
                        type="button"
                        title={`${item.name} (${item.keywords.join(', ')})`}
                        onClick={() => handleSelect(item.char)}
                        className={`h-10 flex items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:scale-110 active:scale-95 transition-all ${
                          isMat ? 'text-base' : 'text-xl'
                        }`}
                        {...(isMat
                          ? { dangerouslySetInnerHTML: { __html: item.char } }
                          : { children: item.char })}
                      >
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 flex items-center justify-between text-[11px] text-zinc-400">
          <span>Click any emoji or callout to insert at cursor</span>
          <kbd className="font-mono text-[10px] bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
            Esc to close
          </kbd>
        </div>
      </div>
    </div>
  );
};
