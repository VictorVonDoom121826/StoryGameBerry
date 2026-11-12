const ENDINGS = new Set(["caughtEnding", "killerDiesEnding", "escapeEnding", "deathEnding"]);

let currentScene = "briefing";
let health = 100;
let minutesAfterThree = 0;
const inventory = ["Flashlight", "Service pistol", "Handcuffs"];
const clues = new Set();

const scenes = {
  briefing: {
    title: "3:00 PM — Police Department",
    character: "Susie Graham",
    text: "Rain rattles the station windows. Susie catches you at the door. “Harper Barks called in a suspicious man carrying a small trash bag at Mr. Mann’s Manor. Then she stopped answering. Carrie just called: Marley has been taken. The trail leads to the manor.” Susie studies your face. “Don’t hold back on Extinction, Kyle. But don’t let him make you reckless.”",
    choices: [
      { text: "Take a breath, check your gear, and head to the manor.", nextScene: "arrival" },
      { text: "Tell Susie you work alone, then leave.", nextScene: "arrival" }
    ]
  },
  arrival: {
    title: "Mr. Mann’s Manor — Front Entrance",
    character: "Kyle Lawson",
    text: "By 3:30, the manor looms against a colorless sky. Your phone lights up with Carrie’s last message: Marley vanished after someone promised to take her to you. Harper’s call is still saved on your phone. The front door hangs open. Somewhere inside, a floorboard creaks.",
    choices: [
      { text: "Enter the manor and search the living room.", nextScene: "livingRoom" },
      { text: "Call Susie for backup before going in.", action: () => { health = Math.min(100, health + 5); }, nextScene: "livingRoom" }
    ]
  },
  livingRoom: {
    title: "Mr. Mann’s Manor — Living Room",
    character: "Kyle Lawson",
    text: "The living room sits at the center of the manor. Dust hangs in the air; the old clock has stopped. A phone lies beneath a chair, its screen cracked. The east hall leads to the kitchen and downstairs bathroom. Stairs rise toward the west wing and main bedroom. A cold draft seeps up from the basement.",
    choices: [
      { text: "Listen to Harper’s saved message.", nextScene: "harperClue", when: () => !clues.has("Harper's message") },
      { text: "Search the east kitchen.", nextScene: "kitchen" },
      { text: "Check the downstairs bathroom.", nextScene: "downstairsBath" },
      { text: "Go upstairs to the west wing.", nextScene: "westWing" },
      { text: "Search the main bedroom.", nextScene: "mainBedroom" },
      { text: "Go down to the basement.", nextScene: "basement", when: () => inventory.includes("Basement key") },
      { text: "Try the basement door.", nextScene: "lockedBasement", when: () => !inventory.includes("Basement key") }
    ]
  },
  harperClue: {
    title: "Harper’s Message",
    character: "Harper Barks — recording",
    text: "Harper’s shaky voice comes through the damaged speaker: “There’s a man in the house. He has a little black bag. He keeps saying ‘Extinction.’ I think he’s going downstairs—” A thud. Silence. You save the message as evidence.",
    choices: [
      { text: "Return to the living room.", action: () => addClue("Harper's message"), nextScene: "livingRoom" }
    ]
  },
  kitchen: {
    title: "The East Kitchen",
    character: "Kyle Lawson",
    text: "A sour chemical odor clings to the kitchen. The cupboards are open, and a drawer has been forced. A brass key glints near the sink. Dark smears trail toward the hall, but you keep your eyes on the details, not the memory they stir.",
    choices: [
      { text: "Collect the brass key and document the chemical residue.", action: () => { addItem("Basement key"); addClue("chemical residue"); }, nextScene: "livingRoom" },
      { text: "Check the downstairs bathroom.", nextScene: "downstairsBath" },
      { text: "Return to the living room.", nextScene: "livingRoom" }
    ]
  },
  downstairsBath: {
    title: "Downstairs Bathroom",
    character: "Kyle Lawson",
    text: "The small bathroom is just right of the kitchen. Muddy shoeprints mark the tile, too large to be Marley’s. One print has a split heel. You photograph the pattern before it disappears beneath your own boots.",
    choices: [
      { text: "Record the footprints as evidence.", action: () => addClue("split-heel footprints"), nextScene: "livingRoom" },
      { text: "Return to the living room.", nextScene: "livingRoom" }
    ]
  },
  westWing: {
    title: "Upstairs — West Wing",
    character: "Kyle Lawson",
    text: "The west wing is colder than the rest of the house. Two bathrooms flank the guest bedroom. The guest room door is locked; a child's bracelet lies just outside it.",
    choices: [
      { text: "Pick up the bracelet and check the first bathroom.", action: () => addClue("Marley's bracelet"), nextScene: "westBath" },
      { text: "Check the other upstairs bathroom.", nextScene: "mainBath" },
      { text: "Try the locked guest bedroom.", nextScene: "lockedGuestRoom" },
      { text: "Return to the living room.", nextScene: "livingRoom" }
    ]
  },
  westBath: {
    title: "West Wing Bathroom",
    character: "Kyle Lawson",
    text: "The faucet drips into a stained basin. There is no one here, only a damp handprint on the door and the steady tick of water.",
    choices: [{ text: "Return to the west wing.", nextScene: "westWing" }]
  },
  mainBath: {
    title: "Main Bedroom Bathroom",
    character: "Kyle Lawson",
    text: "A cracked mirror reflects a tired detective who barely recognizes himself. You rinse the grime from your hands and hear a muffled knock from somewhere below.",
    choices: [{ text: "Return to the west wing.", nextScene: "westWing" }]
  },
  lockedGuestRoom: {
    title: "The Locked Guest Bedroom",
    character: "Kyle Lawson",
    text: "The handle won’t turn. The brass key from the kitchen fits the lock.",
    choices: [
      { text: "Unlock the door and search the room.", nextScene: "guestRoom", when: () => inventory.includes("Basement key") },
      { text: "Go back to the west wing.", nextScene: "westWing" }
    ]
  },
  guestRoom: {
    title: "The Guest Bedroom",
    character: "Kyle Lawson",
    text: "A child's drawing is pinned beneath the bed: Marley and her father holding hands beneath a black sun. Behind it, Extinction has written, “He always leaves people behind.” The message is meant for you. You pocket it as evidence.",
    choices: [
      { text: "Photograph the drawing and return to the west wing.", action: () => addClue("Extinction's threat"), nextScene: "westWing" }
    ]
  },
  mainBedroom: {
    title: "Main Bedroom",
    character: "Kyle Lawson",
    text: "The main bedroom has been searched in a hurry. On the bedside table: a rough sketch of the basement, with a second door marked behind the boiler. A small brass key is taped to the back.",
    choices: [
      { text: "Take the key and sketch, then return to the living room.", action: () => { addItem("Basement key"); addClue("basement sketch"); }, nextScene: "livingRoom" },
      { text: "Check the attached bathroom.", nextScene: "mainBath" }
    ]
  },
  lockedBasement: {
    title: "The Basement Door",
    character: "Kyle Lawson",
    text: "The basement door is locked. From below comes a faint scrape, then nothing. You need to search the house for a key.",
    choices: [{ text: "Go back to the living room.", nextScene: "livingRoom" }]
  },
  basement: {
    title: "The Basement",
    character: "Kyle Lawson",
    text: "The stairs groan under your weight. Two bodies lie beneath dusty sheets. Harper’s badge is caught on a splintered crate. You force yourself to look long enough to make sure she can’t be helped, then notice a fresh trail leading behind the boiler.",
    choices: [
      { text: "Document Harper’s badge and follow the trail to the hidden door.", action: () => addClue("Harper's badge"), nextScene: "cellarDoor" },
      { text: "Follow the trail without stopping.", nextScene: "cellarDoor" },
      { text: "Go back upstairs.", nextScene: "livingRoom" }
    ]
  },
  cellarDoor: {
    title: "Behind the Boiler",
    character: "Kyle Lawson",
    text: "The hidden door is ajar. You hear Marley whisper your name. Beyond it, Markus Grey—Extinction—holds her close and watches you with a calm that feels practiced. His small black bag rests by his feet. “You came alone,” he says. Your hands tighten around the evidence you gathered.",
    choices: [
      { text: "Try to arrest him; use the evidence to keep him talking.", nextScene: "caughtEnding", when: () => clues.size >= 3 },
      { text: "Shoot Extinction before he can hurt Marley.", nextScene: "killerDiesEnding" },
      { text: "Create an opening, get Marley out, and let him escape.", nextScene: "escapeEnding" },
      { text: "Rush him without a plan.", nextScene: "deathEnding" }
    ]
  },
  caughtEnding: {
    title: "Ending — The Arrest",
    character: "Kyle Lawson",
    text: "You name the evidence: Harper’s message, the trail, the threat. For the first time, Extinction hesitates. You move Marley behind you, secure his hands, and call Susie. At 11:40 PM, backup enters the manor. Markus Grey is taken alive. Marley is safe, but the quiet that follows will take longer to mend.",
    ending: true
  },
  killerDiesEnding: {
    title: "Ending — No Way Back",
    character: "Kyle Lawson",
    text: "You fire. Extinction falls, and Marley is safe. The manor goes quiet except for your breathing. In the years to come, you will replay this moment and wonder whether there was another way. At midnight, you leave Mr. Mann’s Manor with your daughter—and a new weight you cannot set down.",
    ending: true
  },
  escapeEnding: {
    title: "Ending — He’s Gone",
    character: "Kyle Lawson",
    text: "You pull Marley clear and get her behind the basement door. Extinction vanishes into the dark before you can follow. Susie arrives at midnight, but the trail is cold. Marley is alive in your arms; Markus Grey is still out there. You know the case is not over.",
    ending: true
  },
  deathEnding: {
    title: "Ending — The Last Case",
    character: "Kyle Lawson",
    text: "You rush him without a plan. The struggle is brief and the basement swallows the sound. At midnight, Extinction walks out of Mr. Mann’s Manor alone. Marley is still missing, and your name joins the others in the basement.",
    ending: true
  }
};

const sceneTitle = document.getElementById("scene-title");
const sceneText = document.getElementById("scene-text");
const choicesContainer = document.getElementById("choices-container");
const characterName = document.getElementById("character-name");
const healthDisplay = document.getElementById("health-display");
const inventoryDisplay = document.getElementById("inventory-display");
const messageDisplay = document.getElementById("message-display");
const timeDisplay = document.getElementById("scene-time");
const clueDisplay = document.getElementById("clue-display");

function addItem(item) {
  if (!inventory.includes(item)) inventory.push(item);
  renderStatus();
}

function addClue(clue) {
  clues.add(clue);
  renderStatus();
}

function renderStatus() {
  if (healthDisplay) healthDisplay.textContent = String(health);
  if (inventoryDisplay) inventoryDisplay.textContent = inventory.join(", ");
  if (clueDisplay) clueDisplay.textContent = clues.size ? `${clues.size} piece(s) of evidence` : "None yet";
}

function updateScene(sceneName) {
  currentScene = sceneName;
  const scene = scenes[sceneName];
  if (!scene) throw new Error(`Unknown scene: ${sceneName}`);

  sceneTitle.textContent = scene.title;
  sceneText.textContent = scene.text;
  characterName.textContent = scene.character || "";
  if (timeDisplay) {
    const totalMinutes = 15 * 60 + minutesAfterThree;
    const hour24 = Math.floor(totalMinutes / 60) % 24;
    const minute = totalMinutes % 60;
    const hour12 = hour24 % 12 || 12;
    timeDisplay.textContent = `${hour12}:${String(minute).padStart(2, "0")} ${hour24 < 12 ? "AM" : "PM"}`;
  }
  if (messageDisplay) messageDisplay.textContent = scene.ending ? "Case closed." : "";
  choicesContainer.replaceChildren();

  (scene.choices || []).filter(choice => !choice.when || choice.when()).forEach(choice => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = choice.text;
    button.addEventListener("click", () => {
      if (choice.action) choice.action();
      if (choice.nextScene) {
        minutesAfterThree = Math.min(minutesAfterThree + 30, 9 * 60);
        const deadlinePassed = minutesAfterThree >= 9 * 60 && !ENDINGS.has(choice.nextScene);
        updateScene(deadlinePassed ? "escapeEnding" : choice.nextScene);
      }
    });
    choicesContainer.appendChild(button);
  });
}

renderStatus();
updateScene(currentScene);
