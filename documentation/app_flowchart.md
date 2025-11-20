flowchart TD
    Start[User Opens App] --> Auth{Is User Logged In}
    Auth -- Yes --> SelectPage[Show Generator Options]
    Auth -- No --> Login[Prompt User to Login]
    Login --> SelectPage[Show Generator Options]
    SelectPage --> IdeaPage[Idea Generator Page]
    SelectPage --> PRDPage[PRD Generator Page]
    IdeaPage --> EnterPrompt[Enter Prompt]
    PRDPage --> EnterPrompt
    EnterPrompt --> SelectAgent[Select AI Agent]
    SelectAgent --> SendRequest[Click Send]
    SendRequest --> APIProxy[Call api ai Route]
    APIProxy --> AIProvider{Select AI Provider}
    AIProvider -- Gemini --> GeminiService[Gemini API]
    AIProvider -- Claude --> ClaudeService[Claude API]
    AIProvider -- Groq --> GroqService[Groq API]
    GeminiService --> StreamResponse[Receive Response]
    ClaudeService --> StreamResponse
    GroqService --> StreamResponse
    StreamResponse --> DisplayResponse[Render in Chat UI]
    DisplayResponse --> Options{User Options}
    Options -- Download --> Download[Download Result]
    Options -- Reload --> Reload[Reload Conversation]
    Options -- Edit --> Edit[Edit Prompt]