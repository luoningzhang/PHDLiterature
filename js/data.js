/* ============================================================
   情绪驱动角色决策计算方法 — 论文数据库
   包含40篇核心文献的完整信息
   ============================================================ */

const CAT_META = {
  rule:     { label: "规则系统",     color: "#0F6E56", bg: "#E1F5EE" },
  llm:      { label: "纯LLM",        color: "#185FA5", bg: "#E6F1FB" },
  finetune: { label: "LLM微调",      color: "#534AB7", bg: "#EEEDFE" },
  rag:      { label: "RAG",           color: "#854F0B", bg: "#FAEEDA" },
  hybrid:   { label: "混合架构",     color: "#993C1D", bg: "#FAECE7" },
  game:     { label: "游戏/互动叙事",color: "#3B6D11", bg: "#EAF3DE" },
  resource: { label: "情绪库/资源",  color: "#5F5E5A", bg: "#F1EFE8" },
};

const PAPERS_DEFAULT = [
  // ──────────────── 规则系统 ────────────────
  {
    id: "occ-1988",
    cat: "rule",
    title: "The Cognitive Structure of Emotions",
    titleZh: "情绪的认知结构",
    year: 1988,
    authors: ["Andrew Ortony", "Gerald L. Clore", "Allan Collins"],
    venue: "Cambridge University Press",
    venueType: "book",
    doi: "10.1017/CBO9780511571299",
    url: "https://www.cambridge.org/core/books/cognitive-structure-of-emotions/7DEE66CD960966B7AFCDFB8E8AB8EB72",
    abstract: "This foundational book proposes a comprehensive theory of the cognitive underpinnings of emotion. The authors identify 22 distinct emotion types, all derivable from three classes of cognitive appraisals: evaluations of events in terms of their desirability for the agent's goals, evaluations of actions in terms of their praiseworthiness or blameworthiness, and evaluations of objects (including persons) in terms of their appealingness. The OCC model became the most widely adopted emotion taxonomy in affective computing and intelligent virtual agents.",
    abstractZh: "本书提出了第一个系统化、可操作的计算情绪理论。22类情绪类型由三类认知评价推演而来：目标相关事件的合意性、行为的可褒贬性、对象的吸引力。OCC模型奠定了情感计算领域的理论基础，被几乎所有后续情绪AI系统引用。",
    descZh: "22类情绪由三类认知评价推演；首个可操作情绪计算规则体系",
    limitZh: "表达层贫乏，规则手工编写",
    keywords: ["appraisal theory", "OCC model", "emotion taxonomy", "cognitive emotion", "22 emotions", "affective computing"],
    contributions: [
      "提出首个完整可操作的情绪分类框架（22类）",
      "将情绪定义为三种认知评价维度的合取",
      "区分情绪、心境、情感倾向三个概念层次",
      "为情感计算奠定理论基础，影响了EMA、FAtiMA、WASABI等所有后续系统"
    ],
    methodology: "哲学分析 × 心理学综合 × 演绎推理",
    stars: 5,
    tags: ["foundational", "theory", "appraisal", "taxonomy"],
    related: ["ema-2009", "fatima-2014", "wasabi-2008", "alma-2005", "flame-2000", "occ-ontology"],
    bibtex: `@book{ortony1988cognitive,
  title     = {The Cognitive Structure of Emotions},
  author    = {Ortony, Andrew and Clore, Gerald L. and Collins, Allan},
  year      = {1988},
  publisher = {Cambridge University Press},
  address   = {Cambridge, UK},
  doi       = {10.1017/CBO9780511571299},
  isbn      = {978-0-521-38664-7}
}`
  },

  {
    id: "ema-2009",
    cat: "rule",
    title: "EMA: A Process Model of Appraisal Dynamics",
    titleZh: "EMA：评价动态过程模型",
    year: 2009,
    authors: ["Stacy Marsella", "Jonathan Gratch"],
    venue: "Cognitive Systems Research",
    venueType: "journal",
    doi: "10.1016/j.cogsys.2008.05.006",
    url: "https://doi.org/10.1016/j.cogsys.2008.05.006",
    abstract: "EMA (Emotion and Adaptation) is a process model of appraisal that draws on Lazarus's stress and coping theory. Unlike static OCC-style rule systems, EMA models the continuous dynamic interplay between cognitive appraisal, emotion generation, coping strategy selection, and re-appraisal. It was deployed as the core emotion engine in USC ICT's virtual human systems, including the widely-used SimCoach and Ellie applications for PTSD research.",
    abstractZh: "EMA基于Lazarus压力-应对理论，建立了评价动态连续过程模型。与静态OCC不同，EMA对认知评价→情绪生成→应对策略选择→重评价的动态循环建模，驱动了USC ICT一系列虚拟人系统。",
    descZh: "基于Lazarus评价—应对理论；驱动USC ICT虚拟人",
    limitZh: "开放世界泛化差",
    keywords: ["appraisal dynamics", "coping", "Lazarus", "EMA", "virtual humans", "USC ICT", "process model"],
    contributions: [
      "将静态评价规则扩展为连续时间动态过程",
      "整合应对策略（problem-focused / emotion-focused）",
      "支持重评价机制（re-appraisal）",
      "驱动了USC ICT多个大型虚拟人部署项目"
    ],
    methodology: "认知心理学 × 符号规则推理 × 动态过程仿真",
    stars: 5,
    tags: ["foundational", "appraisal", "coping", "dynamic", "virtual-humans"],
    related: ["occ-1988", "fatima-2014", "wasabi-2008"],
    bibtex: `@article{marsella2009ema,
  title   = {{EMA}: A Process Model of Appraisal Dynamics},
  author  = {Marsella, Stacy and Gratch, Jonathan},
  journal = {Cognitive Systems Research},
  volume  = {10},
  number  = {1},
  pages   = {70--90},
  year    = {2009},
  doi     = {10.1016/j.cogsys.2008.05.006}
}`
  },

  {
    id: "fatima-2014",
    cat: "rule",
    title: "FAtiMA Modular: Towards an Agent Architecture with a Generic Appraisal Framework",
    titleZh: "FAtiMA模块化：通用评价框架智能体架构",
    year: 2014,
    authors: ["João Dias", "Samuel Mascarenhas", "Ana Paiva"],
    venue: "Springer LNCS 8750",
    venueType: "conference",
    doi: "10.1007/978-3-319-12973-0_3",
    url: "https://link.springer.com/chapter/10.1007/978-3-319-12973-0_3",
    abstract: "FAtiMA Modular presents a modular agent architecture for emotionally-driven characters, built on OCC appraisal theory. The system features a reactive layer for immediate stimulus-response and a deliberative layer for goal-directed planning, with emotion influencing both. It was successfully deployed in FearNot!, an educational anti-bullying game where virtual characters exhibit believable emotional reactions. The modular design enables plugging in different appraisal theories without changing the overall architecture.",
    abstractZh: "FAtiMA模块化架构基于OCC评价理论，包含反应层（即时刺激-响应）和审思层（目标导向规划），情绪同时影响两层决策。系统成功部署于FearNot!教育游戏中。模块化设计允许替换不同评价理论插件。",
    descZh: "OCC-based双层架构（反应层+审思层）；驱动FearNot!教育游戏",
    limitZh: "规则难扩展，语言输出弱",
    keywords: ["FAtiMA", "agent architecture", "OCC", "reactive", "deliberative", "educational games", "FearNot"],
    contributions: [
      "提出反应层+审思层双层情绪决策架构",
      "通用评价插件接口，可替换底层情绪理论",
      "在FearNot!反欺凌教育游戏中完整部署验证",
      "开源实现，社区持续维护"
    ],
    methodology: "OCC评价规则 × 双层BDI架构 × 游戏部署验证",
    stars: 5,
    tags: ["architecture", "OCC", "dual-layer", "BDI", "educational", "open-source"],
    related: ["occ-1988", "ema-2009", "alma-2005"],
    bibtex: `@incollection{dias2014fatima,
  title     = {{FAtiMA} Modular: Towards an Agent Architecture with a Generic Appraisal Framework},
  author    = {Dias, Jo{\~a}o and Mascarenhas, Samuel and Paiva, Ana},
  booktitle = {Engineering Affective Processes in Human-Computer Interaction},
  series    = {Lecture Notes in Computer Science},
  volume    = {8750},
  publisher = {Springer},
  year      = {2014},
  doi       = {10.1007/978-3-319-12973-0_3}
}`
  },

  {
    id: "wasabi-2008",
    cat: "rule",
    title: "WASABI: Affect Simulation for Agents with Believable Interactivity",
    titleZh: "WASABI：具有可信互动性的智能体情感仿真",
    year: 2008,
    authors: ["Christian Becker-Asano"],
    venue: "IOS Press DISKI 319",
    venueType: "thesis",
    doi: "",
    url: "https://iospress.com/book/wasabi-affect-simulation-for-agents-with-believable-interactivity",
    abstract: "WASABI models emotional dynamics in a continuous PAD (Pleasure-Arousal-Dominance) three-dimensional space, allowing smooth emotion transitions and decay over time. It distinguishes between primary emotions (basic Ekman-like states) and secondary emotions (blended, nuanced states). The system was integrated with embodied conversational agents and demonstrated richer, more realistic emotional behavior compared to purely discrete emotion systems.",
    abstractZh: "WASABI在连续PAD（愉悦-唤醒-支配）三维空间中建模情绪动态，实现情绪平滑过渡与衰减。区分初级情绪（Ekman基本情绪）和次级情绪（混合细腻状态），集成于具身对话智能体。",
    descZh: "PAD连续空间模拟情绪动态；区分初级/次级情绪",
    limitZh: "离散决策接口不清晰",
    keywords: ["PAD space", "continuous emotion", "primary emotions", "secondary emotions", "affect dynamics", "ECA"],
    contributions: [
      "PAD三维连续空间建模情绪动态，支持情绪混合",
      "初级/次级情绪的形式化区分",
      "情绪衰减和时间动态的明确建模",
      "与具身对话智能体的集成验证"
    ],
    methodology: "连续向量空间 × PAD情绪模型 × 时间动态仿真",
    stars: 4,
    tags: ["PAD", "continuous", "affect-dynamics", "embodied"],
    related: ["occ-1988", "alma-2005", "ema-2009"],
    bibtex: `@phdthesis{beckerasano2008wasabi,
  title  = {{WASABI}: Affect Simulation for Agents with Believable Interactivity},
  author = {Becker-Asano, Christian},
  year   = {2008},
  school = {University of Bielefeld},
  series = {Dissertations in Artificial Intelligence (DISKI 319)},
  publisher = {IOS Press}
}`
  },

  {
    id: "alma-2005",
    cat: "rule",
    title: "ALMA: A Layered Model of Affect",
    titleZh: "ALMA：分层情感模型",
    year: 2005,
    authors: ["Patrick Gebhard"],
    venue: "AAMAS 2005",
    venueType: "conference",
    doi: "10.1145/1082473.1082478",
    url: "https://dl.acm.org/doi/10.1145/1082473.1082478",
    abstract: "ALMA proposes a three-layered temporal model separating emotion (short-term, event-triggered), mood (medium-term, context-influenced), and personality (stable traits, e.g., Big Five). Emotions are triggered by OCC appraisal rules, and in turn influence mood; personality shapes the baseline. The layered temporal structure allows more realistic long-term character consistency than purely event-reactive systems.",
    abstractZh: "ALMA提出情绪/心境/人格三层时间尺度模型。情绪由OCC事件触发（短期），心境受情绪累积影响（中期），人格（大五特质）提供稳定基准。三层设计实现比单一反应系统更真实的长期角色一致性。",
    descZh: "区分情绪/心境/人格三层时间尺度",
    limitZh: "整合LLM困难",
    keywords: ["layered affect", "emotion", "mood", "personality", "Big Five", "OCC", "temporal model"],
    contributions: [
      "提出情绪-心境-人格三层时间分离模型",
      "明确建模三层之间的相互影响机制",
      "人格与情绪的正式整合（Big Five ↔ OCC）",
      "为长期角色一致性提供理论基础"
    ],
    methodology: "心理学模型综合 × OCC评价 × 层次状态机",
    stars: 4,
    tags: ["layered", "personality", "mood", "temporal", "Big-Five"],
    related: ["occ-1988", "wasabi-2008", "fatima-2014"],
    bibtex: `@inproceedings{gebhard2005alma,
  title     = {{ALMA}: A Layered Model of Affect},
  author    = {Gebhard, Patrick},
  booktitle = {Proceedings of the 4th International Conference on Autonomous Agents and Multiagent Systems (AAMAS)},
  pages     = {29--36},
  year      = {2005},
  doi       = {10.1145/1082473.1082478}
}`
  },

  {
    id: "flame-2000",
    cat: "rule",
    title: "FLAME: Fuzzy Logic Adaptive Model of Emotions",
    titleZh: "FLAME：情绪自适应模糊逻辑模型",
    year: 2000,
    authors: ["Magy Seif El Nasr", "John Yen", "Thomas R. Ioerger"],
    venue: "JAAMAS 3:219–257",
    venueType: "journal",
    doi: "10.1023/A:1010030809960",
    url: "https://link.springer.com/article/10.1023/A:1010030809960",
    abstract: "FLAME integrates fuzzy logic with OCC appraisal theory to handle the inherent vagueness in emotional assessment. Rather than crisp binary rule firings, FLAME uses fuzzy membership functions to represent gradations of emotion intensity and fuzzy inference rules to derive emotional states. This allows more gradual, naturalistic emotion transitions suitable for game characters.",
    abstractZh: "FLAME将模糊逻辑与OCC评价理论结合，用模糊隶属函数表示情绪强度的渐变，通过模糊推理规则推导情绪状态，实现比硬性规则更自然的情绪过渡，适合游戏角色应用。",
    descZh: "模糊逻辑+OCC情绪建模",
    limitZh: "模糊规则设计复杂",
    keywords: ["fuzzy logic", "OCC", "emotion intensity", "adaptive", "game agents", "FLAME"],
    contributions: [
      "将模糊逻辑引入OCC评价体系，处理情绪强度的连续性",
      "模糊规则集使情绪过渡更自然",
      "适应机制允许情绪模型随经验学习调整",
      "游戏AI角色中的早期应用验证"
    ],
    methodology: "模糊逻辑 × OCC规则 × 自适应机制",
    stars: 3,
    tags: ["fuzzy", "OCC", "adaptive", "game-AI"],
    related: ["occ-1988", "alma-2005"],
    bibtex: `@article{elnasr2000flame,
  title   = {{FLAME}: Fuzzy Logic Adaptive Model of Emotions},
  author  = {El~Nasr, Magy Seif and Yen, John and Ioerger, Thomas R.},
  journal = {Autonomous Agents and Multi-Agent Systems},
  volume  = {3},
  pages   = {219--257},
  year    = {2000},
  doi     = {10.1023/A:1010030809960}
}`
  },

  {
    id: "afpl-2024",
    cat: "rule",
    title: "A Probabilistic Logic Framework for OCC Emotions in Multi-Agent Systems",
    titleZh: "多智能体系统中OCC情绪的概率逻辑框架",
    year: 2024,
    authors: ["João Carlos Gluz", "Patricia Augustin Jaques"],
    venue: "Cognitive Systems Research",
    venueType: "journal",
    doi: "",
    url: "",
    abstract: "This paper formalizes 12 of the OCC emotion types as probabilistic logic rules within a multi-agent framework (AfPL). The probabilistic extension addresses the inherent uncertainty in appraisal assessments, allowing agents to reason about emotions with degrees of belief rather than crisp rules. The framework is validated in small-scale simulated scenarios.",
    abstractZh: "将OCC 12种情绪形式化为多智能体概率逻辑（AfPL），概率扩展处理评价的不确定性，允许智能体以信念度而非硬规则推理情绪。小规模仿真场景验证。",
    descZh: "将OCC 12种情绪形式化为多agent概率逻辑",
    limitZh: "实验规模有限",
    keywords: ["probabilistic logic", "OCC", "multi-agent", "AfPL", "uncertainty", "belief"],
    contributions: [
      "OCC情绪的概率逻辑形式化（12类情绪→可计算概率规则）",
      "处理评价不确定性的概率推理机制",
      "多智能体情绪感染与传播的形式化"
    ],
    methodology: "形式逻辑 × 概率推理 × 多智能体仿真",
    stars: 4,
    tags: ["probabilistic", "logic", "OCC", "multi-agent", "formal"],
    related: ["occ-1988", "ema-2009", "flame-2000"],
    bibtex: `@article{gluz2024afpl,
  title   = {A Probabilistic Logic Framework for {OCC} Emotions in Multi-Agent Systems},
  author  = {Gluz, Jo{\~a}o Carlos and Jaques, Patricia Augustin},
  journal = {Cognitive Systems Research},
  year    = {2024}
}`
  },

  {
    id: "appraisal-rl-2024",
    cat: "rule",
    title: "Integrating Appraisal Variables with Reinforcement Learning for Continuous Emotion Prediction",
    titleZh: "评价变量与强化学习整合的连续情绪预测",
    year: 2024,
    authors: ["Anonymous (CHI 2024)"],
    venue: "CHI 2024",
    venueType: "conference",
    doi: "",
    url: "",
    abstract: "This work combines cognitive appraisal variables (goal relevance, goal congruence, coping potential, agency) with Q-learning to predict continuous emotional states throughout interaction sequences. The appraisal variables serve as state features for the RL agent, enabling emotion-aware decision policies. Validated on simplified goal-directed interaction tasks.",
    abstractZh: "将认知评价变量（目标相关性、目标一致性、应对潜力、代理感）与Q-learning结合，预测交互过程中连续情绪状态。评价变量作为RL状态特征，实现情绪感知决策策略，在简单决策任务上验证。",
    descZh: "appraisal变量与Q-learning结合，预测交互过程连续情绪",
    limitZh: "仅验证于简单决策任务",
    keywords: ["appraisal", "reinforcement learning", "Q-learning", "continuous emotion", "emotion prediction"],
    contributions: [
      "首次将评价变量显式引入RL状态空间",
      "实现交互过程中的连续情绪轨迹预测",
      "情绪感知决策策略的初步验证"
    ],
    methodology: "认知评价理论 × Q-learning × 决策任务实验",
    stars: 4,
    tags: ["RL", "appraisal", "continuous-emotion", "decision-making"],
    related: ["occ-1988", "ema-2009", "chain-of-emotion-2024"],
    bibtex: `@inproceedings{anon2024appraisalrl,
  title     = {Integrating Appraisal Variables with Reinforcement Learning for Continuous Emotion Prediction},
  author    = {Anonymous},
  booktitle = {Proceedings of the CHI Conference on Human Factors in Computing Systems},
  year      = {2024}
}`
  },

  // ──────────────── 纯LLM ────────────────
  {
    id: "generative-agents-2023",
    cat: "llm",
    title: "Generative Agents: Interactive Simulacra of Human Behavior",
    titleZh: "生成式智能体：人类行为的交互式仿真",
    year: 2023,
    authors: ["Joon Sung Park", "Joseph C. O'Brien", "Carrie J. Cai", "Meredith Ringel Morris", "Percy Liang", "Michael S. Bernstein"],
    venue: "UIST 2023",
    venueType: "conference",
    doi: "10.1145/3586183.3606763",
    url: "https://arxiv.org/abs/2304.03442",
    abstract: "Generative Agents introduces an architecture for believable human-like NPC behavior using LLMs. The system combines a memory stream (external storage of experiences), a reflection mechanism (periodic synthesis of higher-level observations), and a planning module (goal-directed daily scheduling). Twenty-five agents in a Sims-like virtual town exhibit emergent social behaviors including information spreading, relationship formation, and coordinated group activities. Emotion is implicitly embedded via natural language without explicit causal modeling.",
    abstractZh: "通过记忆流+反思+规划三组件使LLM-NPC产生类人行为。25个智能体在Smallville虚拟小镇中展现出信息传播、关系形成、集体活动等涌现社会行为。情绪隐式嵌入自然语言，无显式因果链。",
    descZh: "记忆流+反思+规划；25个LLM-NPC社会模拟；情绪隐式嵌入",
    limitZh: "情绪无因果链，长程不一致",
    keywords: ["generative agents", "memory stream", "reflection", "planning", "social simulation", "NPC", "emergent behavior"],
    contributions: [
      "记忆流架构：用自然语言外部化长期经验",
      "反思机制：从具体记忆合成高层观察",
      "规划模块：从长期目标到具体日程的层次化规划",
      "25个智能体的完整社会涌现行为演示"
    ],
    methodology: "LLM提示工程 × 外部记忆存储 × 周期性反思 × 评分检索",
    stars: 3,
    tags: ["memory-stream", "reflection", "planning", "social-simulation", "emergent"],
    related: ["gen-agents-memory-2023", "character-llm-2023", "hamlet-2025"],
    bibtex: `@inproceedings{park2023generative,
  title     = {Generative Agents: Interactive Simulacra of Human Behavior},
  author    = {Park, Joon Sung and O'Brien, Joseph C. and Cai, Carrie J. and Morris, Meredith Ringel and Liang, Percy and Bernstein, Michael S.},
  booktitle = {Proceedings of the 36th Annual ACM Symposium on User Interface Software and Technology (UIST)},
  year      = {2023},
  doi       = {10.1145/3586183.3606763},
  eprint    = {2304.03442},
  archivePrefix = {arXiv}
}`
  },

  {
    id: "roleplay-llm-2023",
    cat: "llm",
    title: "Role Play with Large Language Models",
    titleZh: "大语言模型的角色扮演",
    year: 2023,
    authors: ["Murray Shanahan", "Kyle McDonell", "Leland Reynolds"],
    venue: "Nature 623:493",
    venueType: "journal",
    doi: "10.1038/s41586-023-06647-8",
    url: "https://www.nature.com/articles/s41586-023-06647-8",
    abstract: "This theoretical paper analyzes the nature of LLM role-playing from a philosophical perspective. The authors argue that when an LLM plays a character, it occupies a 'superposition of simulacra' — simultaneously maintaining the base model persona, the character being portrayed, and the author giving voice to the character. The paper argues this is categorically different from human role-playing and raises important questions about authenticity, consistency, and the limits of character portrayal in LLMs.",
    abstractZh: "从哲学角度分析LLM角色扮演的本质：LLM角色扮演时处于「仿真叠加态」，同时维持基础模型人格、所扮演角色和为角色发声的作者。论文认为这与人类角色扮演本质不同，对真实性和一致性提出重要问题。",
    descZh: "理论层定义LLM角色扮演本质（角色叠加态）",
    limitZh: "描述性论文，无实现",
    keywords: ["role-play", "LLM", "superposition of simulacra", "theory", "character consistency", "philosophy of AI"],
    contributions: [
      "提出LLM角色扮演的「仿真叠加态」理论框架",
      "区分LLM角色扮演与人类角色扮演的本质差异",
      "提出角色扮演中真实性和一致性的哲学问题",
      "为后续角色评估基准（RPEval、EmoBench）奠定理论背景"
    ],
    methodology: "哲学分析 × 概念框架构建",
    stars: 2,
    tags: ["theory", "philosophy", "superposition", "Nature"],
    related: ["rpeval-2025", "emobench-2024", "character-llm-2023"],
    bibtex: `@article{shanahan2023role,
  title   = {Role Play with Large Language Models},
  author  = {Shanahan, Murray and McDonell, Kyle and Reynolds, Leland},
  journal = {Nature},
  volume  = {623},
  pages   = {493--498},
  year    = {2023},
  doi     = {10.1038/s41586-023-06647-8}
}`
  },

  {
    id: "rpeval-2025",
    cat: "llm",
    title: "RPEval: A Four-Dimensional Benchmark for Evaluating Role-Playing LLMs",
    titleZh: "RPEval：角色扮演LLM四维评测基准",
    year: 2025,
    authors: ["Anonymous (arXiv 2505.13157)"],
    venue: "arXiv 2505.13157",
    venueType: "arxiv",
    doi: "",
    url: "https://arxiv.org/abs/2505.13157",
    abstract: "RPEval introduces a four-dimensional benchmark for evaluating LLM role-playing capabilities: emotional understanding (recognizing emotional context), decision morality (ethical decision-making in role), alignment (staying in character), and role consistency (maintaining character identity over long conversations). Notably, GPT-4o achieves only 5.81% role internal consistency, suggesting fundamental challenges in maintaining coherent character identity across extended interactions.",
    abstractZh: "RPEval提出四维评测：情绪理解、决策道德性、角色对齐、角色内一致性。GPT-4o角色内一致性仅5.81%，揭示了LLM在长对话中保持连贯角色身份的根本挑战。",
    descZh: "四维评测：情绪理解/决策道德/对齐/角色一致性",
    limitZh: "GPT-4o角色内一致性仅5.81%",
    keywords: ["benchmark", "role-playing", "evaluation", "consistency", "alignment", "emotional understanding"],
    contributions: [
      "提出角色扮演LLM的四维评测框架",
      "揭示GPT-4o等顶级模型角色内一致性的严重缺陷（5.81%）",
      "情绪理解与决策道德性的量化评测方法"
    ],
    methodology: "基准构建 × 多模型对比评测",
    stars: 3,
    tags: ["benchmark", "evaluation", "consistency", "arXiv-2025"],
    related: ["roleplay-llm-2023", "emobench-2024", "character-eval-2024"],
    bibtex: `@article{anon2025rpeval,
  title         = {{RPEval}: A Four-Dimensional Benchmark for Evaluating Role-Playing {LLMs}},
  author        = {Anonymous},
  year          = {2025},
  eprint        = {2505.13157},
  archivePrefix = {arXiv}
}`
  },

  {
    id: "emotionhallucer-2025",
    cat: "llm",
    title: "EmotionHallucer: Evaluating Emotional Hallucination in Multimodal LLMs",
    titleZh: "EmotionHallucer：多模态LLM情绪幻觉评估",
    year: 2025,
    authors: ["Anonymous (arXiv 2505.11405)"],
    venue: "arXiv 2505.11405",
    venueType: "arxiv",
    doi: "",
    url: "https://arxiv.org/abs/2505.11405",
    abstract: "EmotionHallucer addresses the phenomenon of emotional hallucination in multimodal LLMs — cases where the model confidently asserts emotional states that are not supported by the input evidence. The benchmark relies on external behavioral cues (facial expressions, gestures, vocal tone) to ground emotion assessment, revealing systematic over-attribution of emotions in current models. However, it does not address latent emotion state inference from context.",
    abstractZh: "评估多模态LLM中情绪幻觉现象——模型对无证据支撑的情绪状态过度自信地断言。基于外部行为线索（表情、手势、声调）的评测揭示了当前模型系统性情绪过度归因问题，但未涵盖基于上下文的潜在情绪推断。",
    descZh: "评估多模态LLM情绪幻觉；依赖外部行为线索",
    limitZh: "潜在情绪状态推断弱",
    keywords: ["emotional hallucination", "multimodal LLM", "evaluation", "behavioral cues", "over-attribution"],
    contributions: [
      "首次系统研究多模态LLM中的情绪幻觉现象",
      "基于外部行为线索的情绪评测框架",
      "揭示当前模型情绪过度归因的系统性缺陷"
    ],
    methodology: "多模态评测 × 幻觉检测 × 人工标注对比",
    stars: 3,
    tags: ["hallucination", "multimodal", "evaluation", "arXiv-2025"],
    related: ["emobench-2024", "rpeval-2025"],
    bibtex: `@article{anon2025emotionhallucer,
  title         = {{EmotionHallucer}: Evaluating Emotional Hallucination in Multimodal {LLMs}},
  author        = {Anonymous},
  year          = {2025},
  eprint        = {2505.11405},
  archivePrefix = {arXiv}
}`
  },

  {
    id: "emobench-2024",
    cat: "llm",
    title: "EmoBench: Evaluating the Emotional Intelligence of Large Language Models",
    titleZh: "EmoBench：大语言模型情绪智能评测",
    year: 2024,
    authors: ["Sahand Sabour", "Siyang Liu", "Zheyuan Zhang", "June M. Liu", "Jinfeng Zhou", "Alvitta Otterbacher", "Rada Mihalcea", "Minlie Huang"],
    venue: "ACL 2024",
    venueType: "conference",
    doi: "",
    url: "https://aclanthology.org/2024.acl-long.326",
    abstract: "EmoBench provides a systematic evaluation of emotional intelligence in LLMs, comprising 400 questions across two tasks: Emotional Understanding (EU, 12 sub-tasks covering emotion recognition, theory of mind, and emotional reasoning) and Emotional Application (EA, 8 sub-tasks covering advice-giving, emotional support). Results reveal that while LLMs perform reasonably on recognition tasks, they struggle significantly with complex emotional reasoning and context-sensitive application.",
    abstractZh: "400题情绪智能评测，分情绪理解（12子任务：识别、心智理论、推理）和情绪应用（8子任务：建议、支持）两大维度。结果显示LLM在识别任务表现尚可，但复杂情绪推理和情境应用存在显著困难。",
    descZh: "400题情绪理解+应用测评",
    limitZh: "多选题与创作决策相关性待验证",
    keywords: ["emotional intelligence", "benchmark", "evaluation", "theory of mind", "LLM", "emotion recognition"],
    contributions: [
      "400题系统化情绪智能评测框架",
      "12维情绪理解子任务的细粒度评测",
      "8维情绪应用能力评测",
      "揭示LLM情绪推理与应用的系统性缺陷"
    ],
    methodology: "基准构建 × 人工标注 × 多模型评测",
    stars: 3,
    tags: ["benchmark", "emotional-intelligence", "ACL-2024", "theory-of-mind"],
    related: ["rpeval-2025", "character-eval-2024", "emotionhallucer-2025"],
    bibtex: `@inproceedings{sabour2024emobench,
  title     = {{EmoBench}: Evaluating the Emotional Intelligence of Large Language Models},
  author    = {Sabour, Sahand and Liu, Siyang and Zhang, Zheyuan and Liu, June M. and Zhou, Jinfeng and Otterbacher, Alvitta and Mihalcea, Rada and Huang, Minlie},
  booktitle = {Proceedings of the 62nd Annual Meeting of the Association for Computational Linguistics (ACL)},
  year      = {2024}
}`
  },

  // ──────────────── LLM微调 ────────────────
  {
    id: "character-llm-2023",
    cat: "finetune",
    title: "Character-LLM: A Trainable Agent for Role-Playing",
    titleZh: "Character-LLM：可训练角色扮演智能体",
    year: 2023,
    authors: ["Yuxiao Shao", "Linyang Li", "Junqi Dai", "Xipeng Qiu"],
    venue: "EMNLP 2023",
    venueType: "conference",
    doi: "",
    url: "https://arxiv.org/abs/2310.10158",
    abstract: "Character-LLM introduces an experience-reconstruction method for training LLMs to role-play historical figures (e.g., Socrates, Hermione, Beethoven). Character experiences are distilled from books and Wikipedia into training dialogues mimicking the character's perspective, then used to fine-tune LLaMA-7B. A protective mechanism prevents the model from breaking character under adversarial probing. Results show improved stylistic authenticity but limited improvement in emotion-driven causal decision-making.",
    abstractZh: "经验重建法：从书籍和Wikipedia中提炼角色经验生成训练数据，微调LLaMA-7B扮演历史人物。保护机制防止被对抗性提示突破角色。结果在语言风格上有改善，但情绪→决策的因果链仍在参数黑盒中。",
    descZh: "经验重建法为历史人物生成训练数据；微调LLaMA-7B",
    limitZh: "复制语言风格而非情绪决策因果",
    keywords: ["character LLM", "role-playing", "fine-tuning", "LLaMA", "experience reconstruction", "historical figures"],
    contributions: [
      "经验重建训练数据生成管线",
      "反越狱保护机制（character protection）",
      "LLaMA-7B角色扮演能力的监督微调",
      "多历史人物的跨域泛化验证"
    ],
    methodology: "数据合成 × 监督微调 × 对抗测试",
    stars: 3,
    tags: ["fine-tuning", "LLaMA", "historical-characters", "EMNLP-2023"],
    related: ["rolellm-2024", "coser-2025", "roleplay-llm-2023"],
    bibtex: `@inproceedings{shao2023character,
  title     = {Character-{LLM}: A Trainable Agent for Role-Playing},
  author    = {Shao, Yuxiao and Li, Linyang and Dai, Junqi and Qiu, Xipeng},
  booktitle = {Proceedings of the 2023 Conference on Empirical Methods in Natural Language Processing (EMNLP)},
  year      = {2023},
  eprint    = {2310.10158},
  archivePrefix = {arXiv}
}`
  },

  {
    id: "rolellm-2024",
    cat: "finetune",
    title: "RoleLLM: Benchmarking, Eliciting, and Enhancing Role-Playing Abilities of LLMs",
    titleZh: "RoleLLM：LLM角色扮演能力的基准、激发与增强",
    year: 2024,
    authors: ["Zekun Moore Wang", "Zhongyuan Peng", "Haoran Que", "Jiaheng Liu", "Wangchunshu Zhou", "Yuhan Wu", "Hongcheng Guo", "Ruitong Gan", "Zehao Ni", "Jian Yang", "Man Zhang", "Zhaoxiang Zhang", "Boshen Yan", "Tiezhen Wang", "Junran Peng", "Ge Zhang", "Xinrun Du", "Ke Xu", "Dahua Lin", "Jiajun Zhang", "Wenhao Huang", "Wenhu Chen"],
    venue: "Findings of ACL 2024",
    venueType: "conference",
    doi: "",
    url: "https://arxiv.org/abs/2310.00746",
    abstract: "RoleLLM presents RoleBench, a large-scale role-playing benchmark with 168,093 samples covering 100 roles from diverse fictional sources. The paper introduces a role-conditioned instruction tuning (RoCIT) approach that conditions LLM fine-tuning on character profiles. Two models are released: RoleLLM (full fine-tune) and RoleLLaMA (LoRA). Despite improved surface-level role adherence, the models lack explicit emotion-to-decision causal mechanisms.",
    abstractZh: "RoleBench: 168,093样本覆盖100个虚构角色的大规模基准。角色条件化指令微调（RoCIT）。发布RoleLLM和RoleLLaMA两个模型。表面角色遵循改善，但情绪→决策因果仍在参数黑盒中。",
    descZh: "RoleBench 168,093样本；角色条件化指令微调",
    limitZh: "情绪→决策因果仍在参数黑盒",
    keywords: ["RoleBench", "role-playing", "instruction tuning", "RoCIT", "LoRA", "LLaMA"],
    contributions: [
      "RoleBench: 168,093样本的大规模角色扮演基准",
      "角色条件化指令微调（RoCIT）框架",
      "RoleLLM和RoleLLaMA开源模型发布",
      "角色扮演能力的系统化量化评测"
    ],
    methodology: "数据构建 × LoRA微调 × 基准评测",
    stars: 3,
    tags: ["benchmark", "fine-tuning", "LoRA", "instruction-tuning", "ACL-2024"],
    related: ["character-llm-2023", "coser-2025", "character-eval-2024"],
    bibtex: `@inproceedings{wang2024rolellm,
  title     = {{RoleLLM}: Benchmarking, Eliciting, and Enhancing Role-Playing Abilities of Large Language Models},
  author    = {Wang, Zekun Moore and Peng, Zhongyuan and Que, Haoran and others},
  booktitle = {Findings of the Association for Computational Linguistics: ACL 2024},
  year      = {2024},
  eprint    = {2310.00746},
  archivePrefix = {arXiv}
}`
  },

  {
    id: "coser-2025",
    cat: "finetune",
    title: "CoSER: Towards Complete and Sufficiently Expressive Role-Playing",
    titleZh: "CoSER：迈向完整且充分表达的角色扮演",
    year: 2025,
    authors: ["Zeming Wei", "Yifei Wang", "Ang Lv", "Rui Yan", "Zhiyuan Liu", "Maosong Sun"],
    venue: "ICML 2025",
    venueType: "conference",
    doi: "",
    url: "https://arxiv.org/abs/2503.05798",
    abstract: "CoSER addresses completeness and expressiveness in LLM role-playing by constructing a dataset from 771 books covering 17,966 characters. The key innovation is the Given-Circumstance Acting (GCA) training paradigm that teaches models to reason from character circumstances before generating responses. The LifeChoice task (evaluating character-appropriate moral decisions) achieves 93.47% accuracy. Emotion consistency evaluation relies on LLM-as-judge, a known limitation.",
    abstractZh: "771本书17,966角色的大规模数据集。Given-Circumstance Acting (GCA)训练范式引导模型先推理角色处境再生成响应。LifeChoice任务（角色适当道德决策）达93.47%。情绪一致性评测依赖LLM-as-judge。",
    descZh: "17,966角色771本书；GCA训练范式；LifeChoice达93.47%",
    limitZh: "情绪一致性评测依赖LLM-as-judge",
    keywords: ["CoSER", "role-playing", "GCA", "book characters", "moral decision", "LifeChoice", "completeness"],
    contributions: [
      "17,966角色771本书的大规模高质量数据集",
      "Given-Circumstance Acting (GCA) 训练范式",
      "LifeChoice任务：角色适当道德决策评测（93.47%）",
      "完整性和充分表达性的形式化定义"
    ],
    methodology: "大规模数据挖掘 × GCA训练 × 多维度评测",
    stars: 4,
    tags: ["ICML-2025", "large-scale", "GCA", "moral-reasoning", "book-characters"],
    related: ["rolellm-2024", "character-llm-2023", "charco-2025"],
    bibtex: `@inproceedings{wei2025coser,
  title     = {{CoSER}: Towards Complete and Sufficiently Expressive Role-Playing},
  author    = {Wei, Zeming and Wang, Yifei and Lv, Ang and Yan, Rui and Liu, Zhiyuan and Sun, Maosong},
  booktitle = {Proceedings of the 42nd International Conference on Machine Learning (ICML)},
  series    = {PMLR},
  volume    = {267},
  year      = {2025},
  eprint    = {2503.05798},
  archivePrefix = {arXiv}
}`
  },

  {
    id: "rolecraft-glm-2024",
    cat: "finetune",
    title: "RoleCraft-GLM: Advancing Personalized Role-Playing in Large Language Models",
    titleZh: "RoleCraft-GLM：大语言模型个性化角色扮演的进展",
    year: 2024,
    authors: ["Meiling Tao", "Xuan Lin", "Zhonghao Hu", "Tianle Lun", "Yunjie Liao", "Xiaoming Shi"],
    venue: "arXiv 2401.09432",
    venueType: "arxiv",
    doi: "",
    url: "https://arxiv.org/abs/2401.09432",
    abstract: "RoleCraft-GLM applies LoRA fine-tuning to ChatGLM3 using role-playing dialogue data augmented with coarse emotion labels. The system enables personalized character creation without requiring extensive training data per character. Emotion labels (coarse categories) guide response generation but lack the granularity needed for appraisal-level reasoning.",
    abstractZh: "LoRA微调ChatGLM3，使用带粗粒度情绪标签的角色对话数据。支持无需大量训练数据的个性化角色创建。情绪标签粒度粗，不足以支持评价级推理。",
    descZh: "LoRA微调ChatGLM3；带情绪标签对话数据",
    limitZh: "情绪标签颗粒度粗",
    keywords: ["RoleCraft", "ChatGLM3", "LoRA", "personalized role-playing", "emotion labels", "Chinese LLM"],
    contributions: [
      "ChatGLM3的角色扮演LoRA微调框架",
      "个性化角色创建的低数据需求方案",
      "带情绪标签的中文角色扮演数据集"
    ],
    methodology: "LoRA微调 × 数据增强 × ChatGLM3",
    stars: 3,
    tags: ["LoRA", "ChatGLM", "Chinese", "personalization", "arXiv-2024"],
    related: ["rolellm-2024", "character-llm-2023"],
    bibtex: `@article{tao2024rolecraft,
  title         = {{RoleCraft-GLM}: Advancing Personalized Role-Playing in Large Language Models},
  author        = {Tao, Meiling and Lin, Xuan and Hu, Zhonghao and Lun, Tianle and Liao, Yunjie and Shi, Xiaoming},
  year          = {2024},
  eprint        = {2401.09432},
  archivePrefix = {arXiv}
}`
  },

  {
    id: "charco-2025",
    cat: "finetune",
    title: "Verifiable Emotion Reward for LLM Character Consistency (CHARCO)",
    titleZh: "CHARCO：LLM角色一致性的可验证情绪奖励",
    year: 2025,
    authors: ["Anonymous (MDPI Information)"],
    venue: "MDPI Information 16(9):738",
    venueType: "journal",
    doi: "10.3390/info16090738",
    url: "https://www.mdpi.com/2078-2489/16/9/738",
    abstract: "CHARCO introduces a reinforcement learning from human feedback (RLHF) approach using emotion consistency as a verifiable reward signal to prevent emotion drift in LLM character portrayal. A dataset of 230,000+ dialogues annotated with 10 emotion labels serves as the training basis. The emotion reward signal significantly reduces inconsistencies across long conversations. However, 10 coarse emotion labels fall far short of representing full appraisal-level emotional dynamics.",
    abstractZh: "以情绪一致性为可验证奖励信号的RLHF方法，防止LLM角色情绪漂移。230,000+对话，10类情绪标签。情绪奖励显著减少长对话不一致性，但10类粗粒度标签远不足以表达评价级情绪动态。",
    descZh: "230,000+对话；10情绪标签；强化信号防情绪漂移",
    limitZh: "情绪标签远不足以表达appraisal",
    keywords: ["RLHF", "emotion reward", "character consistency", "emotion drift", "reinforcement learning"],
    contributions: [
      "情绪一致性作为可验证强化学习奖励信号",
      "防止角色情绪漂移的RLHF框架",
      "230,000+对话情绪标注数据集",
      "长对话一致性的显著改善"
    ],
    methodology: "RLHF × 情绪奖励 × 大规模标注数据",
    stars: 4,
    tags: ["RLHF", "emotion-reward", "consistency", "anti-drift", "MDPI-2025"],
    related: ["coser-2025", "rolellm-2024", "chain-of-emotion-2024"],
    bibtex: `@article{anon2025charco,
  title   = {Verifiable Emotion Reward for {LLM} Character Consistency ({CHARCO})},
  author  = {Anonymous},
  journal = {Information},
  volume  = {16},
  number  = {9},
  pages   = {738},
  year    = {2025},
  doi     = {10.3390/info16090738}
}`
  },

  {
    id: "character-eval-2024",
    cat: "finetune",
    title: "CharacterEval: A Chinese Benchmark for Role-Playing Conversational Agent Evaluation",
    titleZh: "CharacterEval：角色扮演对话智能体评测的中文基准",
    year: 2024,
    authors: ["Quan Tu", "Shilong Fan", "Zihang Tian", "Rui Yan"],
    venue: "ACL 2024",
    venueType: "conference",
    doi: "",
    url: "https://aclanthology.org/2024.acl-long.427",
    abstract: "CharacterEval is a Chinese benchmark for evaluating role-playing conversational agents, comprising 1,785 dialogues covering 77 characters with 13 evaluation metrics. Metrics include character fidelity, personality consistency, emotional expression, and value alignment. The benchmark addresses the lack of Chinese role-playing evaluation resources and provides fine-grained assessment of multiple dimensions.",
    abstractZh: "中文角色扮演对话评测基准：1,785对话，77角色，13项指标（角色忠实度、人格一致性、情绪表达、价值对齐等）。填补中文角色扮演评测空白，提供多维度细粒度评测。",
    descZh: "1,785对话77角色13项指标的中文角色评测基准",
    limitZh: "评测与实际创作决策相关性待验证",
    keywords: ["CharacterEval", "Chinese benchmark", "role-playing", "evaluation", "character fidelity", "emotional expression"],
    contributions: [
      "首个系统化中文角色扮演评测基准",
      "13项细粒度评测指标设计",
      "1,785对话77角色的标注数据集",
      "情绪表达等多维度评测方法"
    ],
    methodology: "人工标注 × 多维指标评测 × 人机一致性验证",
    stars: 3,
    tags: ["benchmark", "Chinese", "evaluation", "ACL-2024", "13-metrics"],
    related: ["rolellm-2024", "emobench-2024", "rpeval-2025"],
    bibtex: `@inproceedings{tu2024charactereval,
  title     = {{CharacterEval}: A Chinese Benchmark for Role-Playing Conversational Agent Evaluation},
  author    = {Tu, Quan and Fan, Shilong and Tian, Zihang and Yan, Rui},
  booktitle = {Proceedings of the 62nd Annual Meeting of the Association for Computational Linguistics (ACL)},
  year      = {2024}
}`
  },

  // ──────────────── RAG ────────────────
  {
    id: "emotional-rag-2024",
    cat: "rag",
    title: "Emotional RAG: Enhancing Role-Playing Agents through Emotional Retrieval-Augmented Generation",
    titleZh: "情绪RAG：通过情绪检索增强角色扮演智能体",
    year: 2024,
    authors: ["Junyi Huang", "Yuming Yang", "Xu Chen", "Zhengxiao Du", "Jie Tang"],
    venue: "IEEE ICKG 2024",
    venueType: "conference",
    doi: "",
    url: "",
    abstract: "Emotional RAG introduces a dual-retrieval mechanism that combines semantic similarity (content relevance) with emotional similarity (affective state matching) for retrieving character memories. The approach requires no additional training and significantly improves emotional consistency in character responses. However, it remains a reactive system — memories are retrieved based on similarity but no proactive emotional causal reasoning is performed.",
    abstractZh: "双重检索机制：语义相似度（内容相关性）+情绪相似度（情感状态匹配）。无需额外训练即可提升角色响应的情绪一致性。但仍是被动调取系统，不主动推演情绪因果链。",
    descZh: "双重检索：语义相似度+情绪相似度；无需额外训练",
    limitZh: "被动调取，不主动推演情绪因果",
    keywords: ["RAG", "emotional retrieval", "dual retrieval", "character memory", "no training", "emotional similarity"],
    contributions: [
      "情绪相似度检索指标（结合内容和情感状态）",
      "无训练即可部署的情绪增强方案",
      "角色记忆情绪一致性的显著提升",
      "情绪相似度计算方法的形式化定义"
    ],
    methodology: "双重检索 × 情绪嵌入 × 无训练部署",
    stars: 4,
    tags: ["RAG", "dual-retrieval", "emotional-similarity", "no-training", "IEEE-2024"],
    related: ["gen-agents-memory-2023", "open-theatre-2025"],
    bibtex: `@inproceedings{huang2024emotional,
  title     = {Emotional {RAG}: Enhancing Role-Playing Agents through Emotional Retrieval-Augmented Generation},
  author    = {Huang, Junyi and Yang, Yuming and Chen, Xu and Du, Zhengxiao and Tang, Jie},
  booktitle = {IEEE International Conference on Knowledge Graph (ICKG)},
  year      = {2024}
}`
  },

  {
    id: "gen-agents-memory-2023",
    cat: "rag",
    title: "Generative Agents Memory Stream (RAG perspective)",
    titleZh: "生成式智能体记忆流（RAG视角）",
    year: 2023,
    authors: ["Joon Sung Park", "Joseph C. O'Brien", "Carrie J. Cai", "Meredith Ringel Morris", "Percy Liang", "Michael S. Bernstein"],
    venue: "UIST 2023",
    venueType: "conference",
    doi: "10.1145/3586183.3606763",
    url: "https://arxiv.org/abs/2304.03442",
    abstract: "The memory stream component of Generative Agents serves as an early RAG implementation for NPC behavior. Each memory is scored by three factors: recency (exponential decay), importance (LLM-judged), and relevance (cosine similarity). This composite score determines which memories are retrieved to inform current decisions. While effective for general behavior, emotion labels are coarse and no explicit decision logic is derived from emotional states.",
    abstractZh: "Generative Agents记忆流作为NPC行为的早期RAG实现。记忆由三因子评分：时近性（指数衰减）、重要性（LLM判断）、相关性（余弦相似度）。情绪标签粗，无情绪→决策显式逻辑。",
    descZh: "recency×importance×relevance三因子检索",
    limitZh: "情绪标签粗，无决策逻辑",
    keywords: ["memory stream", "RAG", "recency", "importance", "relevance", "NPC memory", "retrieval"],
    contributions: [
      "三因子复合记忆检索评分（时近×重要×相关）",
      "NPC长期记忆的外部化存储与检索",
      "重要性评分的LLM自动评估"
    ],
    methodology: "复合评分检索 × 外部记忆存储 × LLM推理",
    stars: 3,
    tags: ["memory", "RAG", "recency", "relevance", "NPC", "UIST-2023"],
    related: ["generative-agents-2023", "emotional-rag-2024", "open-theatre-2025"],
    bibtex: `@inproceedings{park2023generative,
  title     = {Generative Agents: Interactive Simulacra of Human Behavior},
  author    = {Park, Joon Sung and others},
  booktitle = {UIST 2023},
  year      = {2023},
  note      = {Memory stream / RAG perspective},
  doi       = {10.1145/3586183.3606763}
}`
  },

  {
    id: "open-theatre-2025",
    cat: "rag",
    title: "Open-Theatre: A Hierarchical Memory System for Dramatic Narrative Agents",
    titleZh: "Open-Theatre：戏剧叙事智能体的层次化记忆系统",
    year: 2025,
    authors: ["Anonymous (arXiv 2509.16713)"],
    venue: "arXiv 2509.16713",
    venueType: "arxiv",
    doi: "",
    url: "https://arxiv.org/abs/2509.16713",
    abstract: "Open-Theatre proposes a hierarchical memory architecture specifically designed for dramatic narrative agents. The system organizes memories at multiple levels: episodic (scene-level events), semantic (character relationships and world knowledge), and dramatic (narrative arc and tension). The hierarchical structure allows agents to reason about both immediate events and long-term narrative trajectories. However, general-purpose memory structures remain difficult to customize for specific dramatic scenarios.",
    abstractZh: "专为戏剧叙事设计的层次化记忆系统，分情节级（场景事件）、语义级（角色关系/世界知识）、戏剧级（叙事弧/张力）三层。层次结构支持对即时事件和长期叙事轨迹的联合推理，但通用记忆难以按剧情定制。",
    descZh: "专为戏剧叙事设计的层次化记忆系统",
    limitZh: "通用记忆难以随剧情定制",
    keywords: ["hierarchical memory", "dramatic narrative", "episodic memory", "semantic memory", "narrative arc", "theatre"],
    contributions: [
      "面向戏剧叙事的三层记忆架构（情节/语义/戏剧）",
      "叙事弧与张力的显式建模",
      "层次化记忆对长期叙事一致性的支持"
    ],
    methodology: "层次化记忆设计 × 戏剧叙事理论 × 智能体架构",
    stars: 3,
    tags: ["hierarchical-memory", "theatre", "narrative", "arXiv-2025"],
    related: ["gen-agents-memory-2023", "emotional-rag-2024", "facade-2005"],
    bibtex: `@article{anon2025opentheatre,
  title         = {Open-Theatre: A Hierarchical Memory System for Dramatic Narrative Agents},
  author        = {Anonymous},
  year          = {2025},
  eprint        = {2509.16713},
  archivePrefix = {arXiv}
}`
  },

  // ──────────────── 混合架构 ────────────────
  {
    id: "chain-of-emotion-2024",
    cat: "hybrid",
    title: "Chain-of-Emotion Architecture for Emotion-Driven Character Decision-Making",
    titleZh: "情绪链架构：情绪驱动角色决策",
    year: 2024,
    authors: ["Croissant et al."],
    venue: "PLOS ONE 19(5):e0301033",
    venueType: "journal",
    doi: "10.1371/journal.pone.0301033",
    url: "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0301033",
    abstract: "Chain-of-Emotion proposes using OCC appraisal variables as explicit intermediate reasoning steps within LLM chain-of-thought prompting. Rather than directly generating emotional responses, the system first computes appraisal variables (goal relevance, goal congruence, coping potential, accountability, norms violation), then derives emotion labels, then generates character decisions. This makes the emotion-to-decision causal chain transparent and auditable. Validated in a game character experiment with structured decision tasks.",
    abstractZh: "将OCC评价变量作为LLM链式推理的显式中间步骤：先计算评价变量（目标相关性、一致性、应对潜力、责任归属、规范违反），再推导情绪标签，再生成角色决策。使情绪→决策因果链透明可审计。游戏角色实验验证。",
    descZh: "appraisal变量作为LLM链式推理中间步骤；游戏角色实验验证",
    limitZh: "原型系统，未大规模验证",
    keywords: ["chain-of-thought", "appraisal", "OCC", "LLM", "emotion-driven decision", "causal chain", "transparency"],
    contributions: [
      "首次将OCC评价变量嵌入LLM推理链（Chain-of-Emotion）",
      "情绪→决策因果链的透明化与可审计性",
      "游戏角色结构化决策任务的验证实验",
      "为后续appraisal-LLM混合方法奠定范式"
    ],
    methodology: "OCC评价 × 链式思维提示 × 游戏角色实验",
    stars: 5,
    tags: ["chain-of-thought", "appraisal", "OCC", "transparent", "PLOS-ONE-2024", "key-method"],
    related: ["occ-1988", "ema-2009", "hamlet-2025", "appraisalcloudpct-2023"],
    bibtex: `@article{croissant2024chain,
  title   = {Chain-of-Emotion Architecture for Emotion-Driven Character Decision-Making},
  author  = {Croissant et al.},
  journal = {{PLOS ONE}},
  volume  = {19},
  number  = {5},
  pages   = {e0301033},
  year    = {2024},
  doi     = {10.1371/journal.pone.0301033}
}`
  },

  {
    id: "drama-machine-2024",
    cat: "hybrid",
    title: "The Drama Machine: Simulating Character Development with LLMs",
    titleZh: "戏剧机器：用LLM模拟角色发展",
    year: 2024,
    authors: ["Ryan Magee", "Anna Fang", "Dawn Nafus", "Jina Suh"],
    venue: "arXiv 2408.01725",
    venueType: "arxiv",
    doi: "",
    url: "https://arxiv.org/abs/2408.01725",
    abstract: "The Drama Machine uses two LLM instances operating as psychological Ego and Superego to simulate internal character conflict and development. Drawing on Freudian psychology and Goffman's impression management theory, the system generates authentic inner conflict by having the Ego pursue immediate desires while the Superego enforces social norms and long-term character values. This tension drives dramatic character development across narrative arcs.",
    abstractZh: "双LLM实例模拟心理Ego（追求即时欲望）和Superego（执行社会规范/角色价值观），基于弗洛伊德心理学和戈夫曼印象管理理论制造内心冲突，驱动叙事弧中的戏剧性角色发展。评估指标非标准化。",
    descZh: "Ego/Superego双LLM实例；弗洛伊德+戈夫曼框架；制造内心冲突",
    limitZh: "评估指标非标准化",
    keywords: ["drama", "Ego", "Superego", "Freud", "Goffman", "character conflict", "dual LLM", "inner conflict"],
    contributions: [
      "弗洛伊德Ego/Superego双LLM心理冲突模型",
      "戈夫曼印象管理理论的LLM实现",
      "角色内心冲突作为叙事戏剧张力来源",
      "跨对话的动态角色发展建模"
    ],
    methodology: "双LLM实例 × 心理学理论 × 叙事弧生成",
    stars: 4,
    tags: ["dual-LLM", "Freud", "Goffman", "inner-conflict", "narrative", "arXiv-2024"],
    related: ["hamlet-2025", "chain-of-emotion-2024", "facade-2005"],
    bibtex: `@article{magee2024drama,
  title         = {The Drama Machine: Simulating Character Development with {LLMs}},
  author        = {Magee, Ryan and Fang, Anna and Nafus, Dawn and Suh, Jina},
  year          = {2024},
  eprint        = {2408.01725},
  archivePrefix = {arXiv}
}`
  },

  {
    id: "llm-actr-2025",
    cat: "hybrid",
    title: "LLM-ACTR: Neuro-Symbolic Cognitive Architecture Integrating LLM with ACT-R",
    titleZh: "LLM-ACTR：LLM与ACT-R认知架构的神经符号整合",
    year: 2025,
    authors: ["Yiming Wu", "et al."],
    venue: "Neurosymbolic AI (SAGE) 2025",
    venueType: "journal",
    doi: "",
    url: "",
    abstract: "LLM-ACTR bridges neural language generation and symbolic cognitive modeling by converting ACT-R decision trajectories into latent vectors injected into LLM adapter layers. ACT-R's rule-based decision processes (procedural memory, declarative memory retrieval, utility calculation) are thus grounded in language generation. Demonstrated in manufacturing task scenarios; generalization to narrative storytelling domains remains unvalidated.",
    abstractZh: "将ACT-R决策轨迹转换为潜向量注入LLM适配器层，桥接神经语言生成与符号认知建模。ACT-R的规则决策（程序记忆、陈述记忆检索、效用计算）与语言生成接地。制造业场景验证，叙事泛化待验证。",
    descZh: "ACT-R决策轨迹转潜向量注入LLM适配器层",
    limitZh: "制造业场景，叙事泛化待验证",
    keywords: ["ACT-R", "LLM", "neuro-symbolic", "cognitive architecture", "adapter", "latent vector", "decision trajectory"],
    contributions: [
      "ACT-R决策轨迹到LLM潜向量的映射方法",
      "认知架构符号推理与LLM语言生成的桥接",
      "适配器层注入的轻量化整合方案"
    ],
    methodology: "认知架构仿真 × 潜向量提取 × 适配器注入",
    stars: 4,
    tags: ["ACT-R", "neuro-symbolic", "cognitive-arch", "adapter", "SAGE-2025"],
    related: ["soar-1987", "chain-of-emotion-2024", "hamlet-2025"],
    bibtex: `@article{wu2025llmactr,
  title   = {{LLM-ACTR}: Neuro-Symbolic Cognitive Architecture Integrating {LLM} with {ACT-R}},
  author  = {Wu, Yiming and others},
  journal = {Neurosymbolic Artificial Intelligence},
  publisher = {SAGE},
  year    = {2025}
}`
  },

  {
    id: "self-emotion-2024",
    cat: "hybrid",
    title: "Self-Emotion Blended Dialogue Generation in Emotional Support Conversations",
    titleZh: "情绪支持对话中的自身情绪混合生成",
    year: 2024,
    authors: ["Jiaming Zhang", "Tao Meng", "Ge Zhang", "Haitao Mi", "Shuai Gao", "Kan Li"],
    venue: "SIGDIAL 2024",
    venueType: "conference",
    doi: "",
    url: "",
    abstract: "This paper investigates how injecting a speaker's own emotion (independent of the conversation topic) affects dialogue response generation. Experiments show that approximately 50% of decisions change when self-emotion is varied, revealing a strong self-emotion effect on dialogue behavior. However, the mechanism by which self-emotion influences decision-making remains opaque due to end-to-end neural processing.",
    abstractZh: "注入与对话主题无关的说话者自身情绪，研究其对对话响应的影响。实验发现约50%的决策随自身情绪变化而改变，揭示强自身情绪效应。但情绪影响决策机制因端到端神经处理而不透明。",
    descZh: "注入与对话无关的自身情绪；约50%决策变化",
    limitZh: "情绪影响机制仍不透明",
    keywords: ["self-emotion", "dialogue generation", "emotional support", "blended emotion", "decision change"],
    contributions: [
      "自身情绪（非主题情绪）对对话决策的量化影响研究",
      "~50%决策变化率揭示情绪对响应的强效应",
      "情绪混合对话生成的新研究方向"
    ],
    methodology: "受控实验 × 情绪条件注入 × 对话响应分析",
    stars: 4,
    tags: ["self-emotion", "SIGDIAL-2024", "dialogue", "50%-effect"],
    related: ["chain-of-emotion-2024", "drama-machine-2024"],
    bibtex: `@inproceedings{zhang2024self,
  title     = {Self-Emotion Blended Dialogue Generation in Emotional Support Conversations},
  author    = {Zhang, Jiaming and Meng, Tao and Zhang, Ge and Mi, Haitao and Gao, Shuai and Li, Kan},
  booktitle = {Proceedings of the 25th Annual Meeting of the Special Interest Group on Discourse and Dialogue (SIGDIAL)},
  year      = {2024}
}`
  },

  {
    id: "hamlet-2025",
    cat: "hybrid",
    title: "HAMLET: Hierarchical Agent Multi-LLM Emotional Theatre",
    titleZh: "HAMLET：层次化多LLM情绪戏剧智能体",
    year: 2025,
    authors: ["Jiang Chen", "et al."],
    venue: "arXiv 2507.15518",
    venueType: "arxiv",
    doi: "",
    url: "https://arxiv.org/abs/2507.15518",
    abstract: "HAMLET is a multi-agent interactive drama framework integrating a PAD emotional state module, three decision tiers (fast/deliberative/silent), and multi-agent interaction for theatrical narrative generation. The PAD module tracks continuous emotional states; fast decisions handle immediate reactions while deliberative decisions involve full appraisal reasoning. Multiple agents interact to produce emergent dramatic scenes. Currently at early experimental stage.",
    abstractZh: "多智能体互动戏剧框架：PAD情绪状态模块+三档决策（快速/深思/沉默）+多智能体互动戏剧生成。PAD追踪连续情绪状态，快速决策处理即时反应，深思决策执行完整评价推理。处于早期实验阶段。",
    descZh: "PAD模块；快速/深思/沉默三档决策；多agent互动戏剧",
    limitZh: "早期实验阶段",
    keywords: ["HAMLET", "PAD", "multi-agent", "theatre", "hierarchical decision", "interactive drama", "fast/deliberative"],
    contributions: [
      "三档决策架构（快速反应/深思熟虑/沉默），模拟真实决策层次",
      "PAD连续情绪状态模块与决策层的整合",
      "多智能体戏剧互动的场景涌现",
      "叙事张力的情绪驱动控制机制"
    ],
    methodology: "PAD情绪模型 × 层次化决策 × 多智能体框架",
    stars: 4,
    tags: ["PAD", "hierarchical", "multi-agent", "theatre", "arXiv-2025", "three-tier"],
    related: ["chain-of-emotion-2024", "drama-machine-2024", "facade-2005", "wasabi-2008"],
    bibtex: `@article{jiang2025hamlet,
  title         = {{HAMLET}: Hierarchical Agent Multi-{LLM} Emotional Theatre},
  author        = {Jiang, Chen and others},
  year          = {2025},
  eprint        = {2507.15518},
  archivePrefix = {arXiv}
}`
  },

  {
    id: "appraisalcloudpct-2023",
    cat: "hybrid",
    title: "OCC+PAD+LLM Hybrid Architecture for Social Robot Emotional Interaction",
    titleZh: "OCC+PAD+LLM混合架构用于社交机器人情绪交互",
    year: 2023,
    authors: ["Anonymous (PMC10014163)"],
    venue: "PMC10014163",
    venueType: "journal",
    doi: "10.3389/fpsyg.2022.1005736",
    url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10014163/",
    abstract: "This paper presents a hybrid architecture combining OCC appraisal rules, PAD space emotional state tracking, and LLM expression generation for a social robot used in autism rehabilitation therapy. OCC rules compute emotion types from interaction events; PAD coordinates are updated accordingly; LLM generates contextually appropriate verbal expressions. The vertical domain focus limits generalization to open narrative scenarios.",
    abstractZh: "OCC评价规则+PAD情绪状态追踪+LLM表达生成的混合架构，应用于自闭症康复社交机器人。OCC规则从交互事件计算情绪类型；PAD坐标相应更新；LLM生成适当语言表达。垂直领域应用，叙事泛化有限。",
    descZh: "OCC+PAD+LLM表达层；社交机器人自闭症康复",
    limitZh: "垂直领域，叙事泛化有限",
    keywords: ["OCC", "PAD", "LLM", "social robot", "autism", "rehabilitation", "hybrid architecture"],
    contributions: [
      "OCC+PAD+LLM三层混合架构设计",
      "情绪计算到语言表达的完整管线",
      "自闭症康复机器人的实际部署验证"
    ],
    methodology: "OCC规则 × PAD空间 × LLM生成 × 机器人部署",
    stars: 3,
    tags: ["OCC", "PAD", "hybrid", "social-robot", "autism", "vertical-domain"],
    related: ["occ-1988", "wasabi-2008", "chain-of-emotion-2024"],
    bibtex: `@article{anon2023appraisalcloud,
  title   = {{OCC}+{PAD}+{LLM} Hybrid Architecture for Social Robot Emotional Interaction},
  author  = {Anonymous},
  journal = {Frontiers in Psychology},
  year    = {2023},
  note    = {PMC10014163},
  doi     = {10.3389/fpsyg.2022.1005736}
}`
  },

  // ──────────────── 游戏/互动叙事 ────────────────
  {
    id: "facade-2005",
    cat: "game",
    title: "Façade: An Experiment in Building a Fully-Realized Interactive Drama",
    titleZh: "Façade：构建完整实现互动戏剧的实验",
    year: 2005,
    authors: ["Michael Mateas", "Andrew Stern"],
    venue: "AIIDE 2005",
    venueType: "conference",
    doi: "",
    url: "https://www.aaai.org/Library/AIIDE/2005/aiide05-007.php",
    abstract: "Façade is the first commercially released interactive drama with believable AI-driven characters. Built using the ABL (A Behavior Language) reactive planning language and a drama manager for narrative control, the system allows players to have natural language conversations with two AI characters (Trip and Grace) in a story about a troubled relationship. Despite handcrafted rules, Façade demonstrates that AI-driven emotional characters can create genuine dramatic experiences.",
    abstractZh: "首个具有可信AI角色的商业互动戏剧。使用ABL行为语言实现反应式规划，drama manager控制叙事结构。玩家与Trip和Grace进行自然语言对话，体验人际关系故事。尽管规则手工编写，证明了AI情绪角色可创造真实戏剧体验。",
    descZh: "ABL行为语言+drama manager；第一个互动戏剧系统",
    limitZh: "规则手工编写，扩展困难",
    keywords: ["Façade", "ABL", "drama manager", "interactive drama", "reactive planning", "natural language", "commercial"],
    contributions: [
      "首个完整实现的商业互动戏剧系统",
      "ABL行为语言的情绪驱动角色实现",
      "drama manager：叙事弧的主动管控",
      "证明AI情绪角色可支撑完整戏剧体验"
    ],
    methodology: "ABL行为语言 × drama manager × 规则手工编写",
    stars: 4,
    tags: ["foundational", "interactive-drama", "ABL", "drama-manager", "commercial", "AIIDE-2005"],
    related: ["soar-1987", "drama-machine-2024", "hamlet-2025", "open-theatre-2025"],
    bibtex: `@inproceedings{mateas2005facade,
  title     = {{Fa{\c{c}}ade}: An Experiment in Building a Fully-Realized Interactive Drama},
  author    = {Mateas, Michael and Stern, Andrew},
  booktitle = {Proceedings of the AAAI Conference on Artificial Intelligence and Interactive Digital Entertainment (AIIDE)},
  year      = {2005}
}`
  },

  {
    id: "soar-1987",
    cat: "game",
    title: "SOAR: An Architecture for General Intelligence",
    titleZh: "SOAR：通用智能架构",
    year: 1987,
    authors: ["John E. Laird", "Allen Newell", "Paul S. Rosenbloom"],
    venue: "Artificial Intelligence 33(1):1–64",
    venueType: "journal",
    doi: "10.1016/0004-3702(87)90050-6",
    url: "https://doi.org/10.1016/0004-3702(87)90050-6",
    abstract: "Soar is a general cognitive architecture for implementing intelligent agents, based on the unified theories of cognition. It features a production rule system, working memory, long-term declarative knowledge, and a problem space search framework. Later extensions (Soar-Emotion, Soar with appraisal) added emotion modules to support more believable agent behavior. Despite powerful reasoning capabilities, Soar has a steep learning curve and limited deployment in modern narrative AI applications.",
    abstractZh: "基于认知统一理论的通用认知架构：产生式规则系统、工作记忆、长期陈述知识、问题空间搜索。后续扩展添加了情绪模块（Soar-Emotion）支持可信智能体行为。功能强大但学习曲线陡峭，现代叙事AI应用有限。",
    descZh: "通用认知架构；扩展支持appraisal情绪",
    limitZh: "学习曲线陡，叙事应用有限",
    keywords: ["Soar", "cognitive architecture", "production rules", "problem space", "working memory", "general intelligence"],
    contributions: [
      "首个完整的通用认知架构（产生式系统+工作记忆+长期知识）",
      "问题空间搜索框架统一了规划与学习",
      "持续演进40年，添加了appraisal情绪扩展",
      "认知科学与AI的基础桥梁"
    ],
    methodology: "产生式规则 × 问题空间搜索 × 认知科学理论",
    stars: 3,
    tags: ["cognitive-architecture", "production-rules", "foundational", "AI-1987"],
    related: ["llm-actr-2025", "facade-2005", "occ-1988"],
    bibtex: `@article{laird1987soar,
  title   = {{SOAR}: An Architecture for General Intelligence},
  author  = {Laird, John E. and Newell, Allen and Rosenbloom, Paul S.},
  journal = {Artificial Intelligence},
  volume  = {33},
  number  = {1},
  pages   = {1--64},
  year    = {1987},
  doi     = {10.1016/0004-3702(87)90050-6}
}`
  },

  {
    id: "npc-emotion-player-2024",
    cat: "game",
    title: "Effects of LLM-based NPC Emotions on Player Emotions in Games",
    titleZh: "LLM驱动NPC情绪对玩家情绪影响的实证研究",
    year: 2024,
    authors: ["Valentino Marincioni", "Reza Habibi", "Bilal Chaudhry", "Julian Togelius"],
    venue: "IEEE CoG 2024",
    venueType: "conference",
    doi: "",
    url: "",
    abstract: "This empirical study investigates asymmetries in how NPC emotional states affect player emotional responses in LLM-driven games. Surprisingly, players often respond positively to negatively-valenced NPCs (e.g., sad or angry characters), suggesting emotional contagion is not a simple mirroring effect. The results have implications for emotional NPC design but the underlying perceptual asymmetry mechanism is not fully explained.",
    abstractZh: "实证研究：LLM驱动NPC情绪对玩家情绪反应的影响。出乎意料地发现玩家对负面情绪NPC（悲伤/愤怒）常产生正向反应，表明情绪感染非简单镜像效应。情绪感知非对称性机制未解释。",
    descZh: "实证：玩家对负面情绪NPC也常正向反应",
    limitZh: "情绪感知非对称性未解释",
    keywords: ["NPC emotion", "player emotion", "emotional contagion", "asymmetry", "LLM game", "empirical study"],
    contributions: [
      "首次量化LLM-NPC情绪对玩家情绪的影响",
      "揭示情绪感染的非对称性（负面NPC→正向玩家反应）",
      "游戏情绪NPC设计的实证依据"
    ],
    methodology: "用户研究 × 受控实验 × 情绪测量量表",
    stars: 3,
    tags: ["empirical", "NPC", "player-emotion", "asymmetry", "IEEE-CoG-2024"],
    related: ["generative-agents-2023", "facade-2005", "drama-llama-2025"],
    bibtex: `@inproceedings{marincioni2024effects,
  title     = {Effects of {LLM}-based {NPC} Emotions on Player Emotions in Games},
  author    = {Marincioni, Valentino and Habibi, Reza and Chaudhry, Bilal and Togelius, Julian},
  booktitle = {IEEE Conference on Games (CoG)},
  year      = {2024}
}`
  },

  {
    id: "drama-llama-2025",
    cat: "game",
    title: "Drama Llama: Combining Storylets with LLMs for Interactive Narrative",
    titleZh: "Drama Llama：故事片段与LLM结合的互动叙事",
    year: 2025,
    authors: ["Anonymous (arXiv 2501.09099)"],
    venue: "arXiv 2501.09099",
    venueType: "arxiv",
    doi: "",
    url: "https://arxiv.org/abs/2501.09099",
    abstract: "Drama Llama combines traditional narrative design patterns (storylets — discrete, author-specified narrative fragments) with LLM generation for interactive drama. The storylet framework provides structural narrative control while LLMs handle flexible dialogue and character expression within each storylet. This hybrid approach bridges the gap between authored narrative games and pure LLM generation. Current experiments are small-scale.",
    abstractZh: "故事片段（storylets：离散的作者指定叙事片段）+LLM的互动叙事混合方案。故事片段框架提供结构性叙事控制，LLM处理片段内的灵活对话和角色表达。小规模实验阶段。",
    descZh: "storylets+LLM；传统叙事设计与AI结合",
    limitZh: "实验规模小",
    keywords: ["storylets", "LLM", "interactive narrative", "Drama Llama", "hybrid narrative", "authored games"],
    contributions: [
      "Storylets×LLM混合叙事架构设计",
      "传统作者式叙事控制与LLM灵活生成的桥接",
      "互动叙事新范式的探索验证"
    ],
    methodology: "故事片段设计 × LLM生成 × 互动叙事实验",
    stars: 3,
    tags: ["storylets", "narrative", "hybrid", "arXiv-2025"],
    related: ["facade-2005", "hamlet-2025", "open-theatre-2025"],
    bibtex: `@article{anon2025drama,
  title         = {Drama Llama: Combining Storylets with {LLMs} for Interactive Narrative},
  author        = {Anonymous},
  year          = {2025},
  eprint        = {2501.09099},
  archivePrefix = {arXiv}
}`
  },

  // ──────────────── 情绪库/资源 ────────────────
  {
    id: "occ-ontology",
    cat: "resource",
    title: "OCC Emotion Ontology (22 Categories)",
    titleZh: "OCC情绪本体（22类）",
    year: 1988,
    authors: ["Andrew Ortony", "Gerald L. Clore", "Allan Collins"],
    venue: "Cambridge University Press",
    venueType: "book",
    doi: "10.1017/CBO9780511571299",
    url: "https://www.cambridge.org/core/books/cognitive-structure-of-emotions/7DEE66CD960966B7AFCDFB8E8AB8EB72",
    abstract: "The OCC ontology provides the formal categorical structure underlying the OCC emotion theory. The 22 emotion types are organized into a hierarchy based on three appraisal types: Well-being (happy-for, gloating, resentment, sorry-for), Attribution (pride, shame, admiration, reproach), and Attraction (love, hate). Each emotion has a formal definition as a conjunction of appraisal conditions, enabling computational implementation.",
    abstractZh: "OCC情绪本体的形式化类别结构：22类情绪按三种评价类型层次组织：幸福感（为他高兴/幸灾乐祸/怨恨/同情）、归因（骄傲/羞耻/钦佩/指责）、吸引力（爱/恨）。每类情绪定义为评价条件的合取，支持计算实现。",
    descZh: "22类情绪=appraisal变量的合取；最广泛使用的情绪分类体系",
    limitZh: "颗粒度与LLM对接困难",
    keywords: ["OCC ontology", "22 emotions", "emotion taxonomy", "appraisal", "well-being", "attribution", "attraction"],
    contributions: [
      "22类情绪的形式化本体定义",
      "三大评价维度的层次分类体系",
      "计算情绪学使用最广泛的标准分类框架",
      "可直接映射为计算规则的形式化定义"
    ],
    methodology: "本体形式化 × 认知理论",
    stars: 5,
    tags: ["ontology", "OCC", "taxonomy", "foundational", "most-cited"],
    related: ["occ-1988", "ema-2009", "fatima-2014", "nrc-emolex-2013"],
    bibtex: `@book{ortony1988occ,
  title     = {The Cognitive Structure of Emotions},
  author    = {Ortony, Andrew and Clore, Gerald L. and Collins, Allan},
  year      = {1988},
  publisher = {Cambridge University Press},
  note      = {OCC Emotion Ontology, 22 categories},
  doi       = {10.1017/CBO9780511571299}
}`
  },

  {
    id: "nrc-emolex-2013",
    cat: "resource",
    title: "Crowdsourcing a Word-Emotion Association Lexicon (NRC EmoLex)",
    titleZh: "NRC EmoLex：众包词-情绪关联词典",
    year: 2013,
    authors: ["Saif M. Mohammad", "Peter D. Turney"],
    venue: "Computational Intelligence 29(3)",
    venueType: "journal",
    doi: "10.1111/j.1467-8640.2012.00460.x",
    url: "https://doi.org/10.1111/j.1467-8640.2012.00460.x",
    abstract: "NRC EmoLex provides 14,182 English words annotated with eight basic emotion categories (Plutchik's wheel: anger, fear, anticipation, trust, surprise, sadness, joy, disgust) plus positive/negative sentiment, constructed via crowdsourcing on Mechanical Turk. It is the most widely used lexical resource in computational emotion analysis. Limitations include context-independence (word meaning depends on context) and lack of appraisal structure.",
    abstractZh: "14,182英文词标注Plutchik 8类基本情绪（愤怒、恐惧、期待、信任、惊讶、悲伤、喜悦、厌恶）+正负情感，通过Mechanical Turk众包构建。计算情绪分析最广泛使用的词典资源。缺点：静态词→情绪映射，缺情境依赖和评价结构。",
    descZh: "14,182词标注Plutchik 8类情绪+正负情感",
    limitZh: "静态词→情绪映射，缺情境依赖",
    keywords: ["NRC EmoLex", "word-emotion lexicon", "Plutchik", "crowdsourcing", "8 emotions", "sentiment", "lexical resource"],
    contributions: [
      "14,182词覆盖Plutchik 8类情绪的大规模词典",
      "众包标注方法的系统化方法论",
      "计算情绪分析的基础词典资源",
      "多语言扩展版本持续维护"
    ],
    methodology: "Mechanical Turk众包 × 标注一致性验证",
    stars: 4,
    tags: ["lexicon", "Plutchik", "crowdsourcing", "word-emotion", "14k-words"],
    related: ["nrc-affect-intensity-2017", "sentic-2018", "go-emotions-2020"],
    bibtex: `@article{mohammad2013crowdsourcing,
  title   = {Crowdsourcing a Word-Emotion Association Lexicon},
  author  = {Mohammad, Saif M. and Turney, Peter D.},
  journal = {Computational Intelligence},
  volume  = {29},
  number  = {3},
  pages   = {436--465},
  year    = {2013},
  doi     = {10.1111/j.1467-8640.2012.00460.x}
}`
  },

  {
    id: "nrc-affect-intensity-2017",
    cat: "resource",
    title: "Word Affect Intensities (NRC Affect Intensity Lexicon)",
    titleZh: "NRC情绪强度词典",
    year: 2017,
    authors: ["Saif M. Mohammad"],
    venue: "arXiv 1704.08798",
    venueType: "arxiv",
    doi: "",
    url: "https://arxiv.org/abs/1704.08798",
    abstract: "The NRC Affect Intensity Lexicon provides continuous intensity scores (0-1) for approximately 6,000 English words across four basic emotions (anger, fear, sadness, joy). Unlike categorical lexicons, it captures degrees of emotional expression. The resource is useful for emotion intensity regression tasks but lacks appraisal structure and contextual dependency modeling.",
    abstractZh: "~6,000英文词的四类基本情绪（愤怒/恐惧/悲伤/喜悦）连续强度评分（0-1）。与分类词典不同，捕捉情绪表达的程度。缺乏评价结构和情境依赖建模。",
    descZh: "~6,000词连续情绪强度（0-1）",
    limitZh: "颗粒度粗，无appraisal结构",
    keywords: ["affect intensity", "continuous emotion", "intensity lexicon", "NRC", "4 emotions", "regression"],
    contributions: [
      "首个大规模情绪连续强度词典（~6000词）",
      "0-1连续评分捕捉情绪表达强度",
      "情绪强度回归任务的基础资源"
    ],
    methodology: "众包标注 × 连续评分聚合",
    stars: 3,
    tags: ["lexicon", "intensity", "continuous", "NRC", "arXiv-2017"],
    related: ["nrc-emolex-2013", "sentic-2018"],
    bibtex: `@article{mohammad2017word,
  title         = {Word Affect Intensities},
  author        = {Mohammad, Saif M.},
  year          = {2017},
  eprint        = {1704.08798},
  archivePrefix = {arXiv}
}`
  },

  {
    id: "sentic-2018",
    cat: "resource",
    title: "SenticNet / EmoSenticNet: Concept-Level Sentiment and Emotion Resource",
    titleZh: "SenticNet/EmoSenticNet：概念级情感与情绪资源",
    year: 2018,
    authors: ["Erik Cambria", "Soujanya Poria", "Devamanyu Hazarika", "Kenneth Kwok"],
    venue: "持续更新 (AAAI, ACL等)",
    venueType: "resource",
    doi: "",
    url: "https://sentic.net/",
    abstract: "SenticNet is a concept-level affective computing resource that assigns sentic values (pleasantness, attention, sensitivity, aptitude) and polarity to ~100,000 natural language concepts. EmoSenticNet extends it with Plutchik emotion labels for 13,171 words. Unlike word-level resources, SenticNet operates at the concept level, enabling more nuanced sentiment reasoning. However, emotion inference capabilities remain limited.",
    abstractZh: "概念级情感计算资源：~100,000自然语言概念的感性值（愉悦度、注意度、敏感度、适应度）和极性。EmoSenticNet扩展13,171词的Plutchik情绪标签。概念级操作比词级更细腻，但情绪推演能力弱。",
    descZh: "概念级情感资源；13,171词情绪扩展",
    limitZh: "情绪推演能力弱",
    keywords: ["SenticNet", "concept-level", "sentiment", "affective computing", "Plutchik", "natural language concepts"],
    contributions: [
      "100,000概念级情感知识库（4维感性值）",
      "EmoSenticNet：13,171词的Plutchik情绪扩展",
      "概念级情感推理框架",
      "持续更新维护（v1~v9+）"
    ],
    methodology: "知识工程 × 众包扩展 × 持续迭代",
    stars: 3,
    tags: ["concept-level", "knowledge-base", "Plutchik", "continuous-update"],
    related: ["nrc-emolex-2013", "nrc-affect-intensity-2017"],
    bibtex: `@misc{cambria2018senticnet,
  title  = {{SenticNet} / {EmoSenticNet}: Concept-Level Sentiment and Emotion Resource},
  author = {Cambria, Erik and Poria, Soujanya and Hazarika, Devamanyu and Kwok, Kenneth},
  year   = {2018},
  url    = {https://sentic.net/}
}`
  },

  {
    id: "characterbench-2024",
    cat: "resource",
    title: "CharacterBench: Benchmarking Character Consistency in Role-Playing",
    titleZh: "CharacterBench：角色扮演中角色一致性基准测试",
    year: 2024,
    authors: ["Anonymous (2024)"],
    venue: "2024",
    venueType: "arxiv",
    doi: "",
    url: "",
    abstract: "CharacterBench provides a large-scale benchmark with 22,859 samples covering 3,956 characters, annotated across 11 dimensions including emotion expression, moral values, trustworthiness, and personality consistency. The benchmark enables comprehensive evaluation of role-playing consistency but reveals significant discrepancies between benchmark dimensions and the consistency requirements of dramatic character writing.",
    abstractZh: "22,859样本覆盖3,956角色的大规模基准，11维标注含情绪表达、道德价值观、可信度、人格一致性。全面评测角色扮演一致性，但评测维度与剧作角色一致性需求存在差距。",
    descZh: "22,859样本3,956角色；11维标注含情绪/道德/可信度",
    limitZh: "评测维度与剧作角色一致性差异大",
    keywords: ["CharacterBench", "character consistency", "11 dimensions", "3956 characters", "benchmark", "moral values"],
    contributions: [
      "22,859样本3,956角色的大规模角色一致性基准",
      "11维细粒度标注框架（含情绪、道德、可信度）",
      "角色一致性多维评测的标准化方法"
    ],
    methodology: "大规模标注 × 多维一致性评测",
    stars: 3,
    tags: ["benchmark", "11-dimensions", "3956-characters", "consistency"],
    related: ["character-eval-2024", "rolellm-2024", "cross-incharacter-2024"],
    bibtex: `@article{anon2024characterbench,
  title  = {{CharacterBench}: Benchmarking Character Consistency in Role-Playing},
  author = {Anonymous},
  year   = {2024}
}`
  },

  {
    id: "cross-incharacter-2024",
    cat: "resource",
    title: "CroSS / InCharacter: Evaluating LLM Personality Consistency via Psychological Scales",
    titleZh: "CroSS/InCharacter：通过心理量表评估LLM人格一致性",
    year: 2024,
    authors: ["Wang et al."],
    venue: "2024",
    venueType: "conference",
    doi: "",
    url: "",
    abstract: "CroSS and InCharacter propose using standardized psychological scales (Big Five, MBTI, etc.) to quantitatively assess whether LLMs maintain consistent personality traits during role-playing. The approach provides an objective measurement framework independent of subjective human evaluation. However, personality traits as measured by psychological scales are distinct from emotion-driven decision logic, limiting direct applicability to affective computing.",
    abstractZh: "使用标准化心理量表（大五人格、MBTI等）量化评估LLM角色扮演中人格一致性。提供独立于主观人工评估的客观测量框架。但心理量表测量的人格特质与情绪驱动决策逻辑不同，限制了对情感计算的直接适用性。",
    descZh: "通过心理量表评估LLM人格一致性",
    limitZh: "人格≠情绪逻辑",
    keywords: ["CroSS", "InCharacter", "personality", "psychological scales", "Big Five", "MBTI", "consistency"],
    contributions: [
      "心理量表作为LLM人格一致性客观评测工具",
      "大五人格/MBTI的量化一致性测量",
      "独立于主观评价的客观评测框架"
    ],
    methodology: "心理量表 × LLM角色扮演 × 量化一致性分析",
    stars: 3,
    tags: ["personality", "Big-Five", "MBTI", "psychological-scales", "objective-eval"],
    related: ["characterbench-2024", "character-eval-2024", "alma-2005"],
    bibtex: `@article{wang2024cross,
  title  = {{CroSS} / {InCharacter}: Evaluating {LLM} Personality Consistency via Psychological Scales},
  author = {Wang et al.},
  year   = {2024}
}`
  },

  {
    id: "go-emotions-2020",
    cat: "resource",
    title: "GoEmotions: A Dataset of Fine-Grained Emotions",
    titleZh: "GoEmotions：细粒度情绪数据集",
    year: 2020,
    authors: ["Dorottya Demszky", "Dana Movshovitz-Attias", "Jeongwoo Ko", "Alan Cowen", "Gaurav Nemade", "Sujith Ravi"],
    venue: "ACL 2020",
    venueType: "conference",
    doi: "10.18653/v1/2020.acl-main.372",
    url: "https://aclanthology.org/2020.acl-main.372",
    abstract: "GoEmotions provides 58,000 Reddit comments annotated with 27 fine-grained emotion categories by raters at Google. The 27 categories go beyond basic emotions to include nuanced states like curiosity, excitement, nervousness, and relief. As a benchmark dataset, it has been used to train and evaluate emotion classifiers, but its social-media origin limits generalization to narrative literary contexts.",
    abstractZh: "58,000条Reddit评论标注27类细粒度情绪（Google员工标注）。27类超越基本情绪，含好奇、兴奋、紧张、宽慰等细腻状态。作为基准数据集广泛用于情绪分类器训练评估，但社交媒体来源限制了叙事文学场景的迁移。",
    descZh: "Reddit 27类细粒度情绪标注，58,000条",
    limitZh: "社交媒体语境，叙事迁移有限",
    keywords: ["GoEmotions", "27 emotions", "fine-grained", "Reddit", "Google", "dataset", "emotion classification"],
    contributions: [
      "58,000条的大规模细粒度情绪标注数据集",
      "27类情绪类别超越基本情绪分类体系",
      "Google规模标注的高质量多标签标注",
      "情绪分类基准数据集的广泛采用"
    ],
    methodology: "众包标注 × 多标签分类 × 标注一致性控制",
    stars: 2,
    tags: ["dataset", "27-emotions", "fine-grained", "Reddit", "ACL-2020"],
    related: ["nrc-emolex-2013", "nrc-affect-intensity-2017", "sentic-2018"],
    bibtex: `@inproceedings{demszky2020goemotions,
  title     = {{GoEmotions}: A Dataset of Fine-Grained Emotions},
  author    = {Demszky, Dorottya and Movshovitz-Attias, Dana and Ko, Jeongwoo and Cowen, Alan and Nemade, Gaurav and Ravi, Sujith},
  booktitle = {Proceedings of the 58th Annual Meeting of the Association for Computational Linguistics (ACL)},
  pages     = {4040--4054},
  year      = {2020},
  doi       = {10.18653/v1/2020.acl-main.372}
}`
  },
];

// ─── localStorage persistence ───────────────────────────────────────────────

function loadPapers() {
  try {
    const saved = localStorage.getItem('phd_papers');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return JSON.parse(JSON.stringify(PAPERS_DEFAULT));
}

function savePapers(papers) {
  try {
    localStorage.setItem('phd_papers', JSON.stringify(papers));
  } catch (e) {}
}

function loadNotes() {
  try {
    return JSON.parse(localStorage.getItem('phd_notes') || '{}');
  } catch (e) { return {}; }
}

function saveNotes(notes) {
  try {
    localStorage.setItem('phd_notes', JSON.stringify(notes));
  } catch (e) {}
}

function loadBookmarks() {
  try {
    return JSON.parse(localStorage.getItem('phd_bookmarks') || '[]');
  } catch (e) { return []; }
}

function saveBookmarks(bm) {
  try {
    localStorage.setItem('phd_bookmarks', JSON.stringify(bm));
  } catch (e) {}
}

function loadReadStatus() {
  try {
    return JSON.parse(localStorage.getItem('phd_read') || '{}');
  } catch (e) { return {}; }
}

function saveReadStatus(rs) {
  try {
    localStorage.setItem('phd_read', JSON.stringify(rs));
  } catch (e) {}
}
