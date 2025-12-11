import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, AlertTriangle, ShieldCheck, Check, X, ChevronsRight, Award, RotateCw, Home, Globe, Loader2 } from 'lucide-react';
import { ALL_NATIVE_LANGUAGES } from '../constants';
import { translateQuizQuestion } from '../services/gemini';

type QuizQuestion = {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
};

const QUIZ_QUESTIONS: QuizQuestion[] = [
  // Section 1: Copyright Basics
  {
    id: 1,
    question: "What is copyright?",
    options: ["A government tax on creative works", "A legal right granted to creators for their original works", "A type of business license", "A system for rating movies"],
    correctAnswer: "A legal right granted to creators for their original works",
    explanation: "Copyright is a form of intellectual property law that protects original works of authorship as soon as the author fixes the work in a tangible form of expression."
  },
  {
    id: 2,
    question: "When is an original work protected by copyright?",
    options: ["Only after it's registered with the government", "As soon as it is created and fixed in a tangible medium", "Only when it's published with a © symbol", "After it becomes commercially successful"],
    correctAnswer: "As soon as it is created and fixed in a tangible medium",
    explanation: "Copyright protection is automatic. The moment you write a story, record a song, or take a photo, it's copyrighted."
  },
  {
    id: 3,
    question: "Who is generally the first owner of a copyright?",
    options: ["The government", "The publisher", "The person who created the work", "The platform where it's uploaded"],
    correctAnswer: "The person who created the work",
    explanation: "The creator of the work, often called the 'author', is the initial owner of the copyright."
  },
  {
    id: 4,
    question: "How long does copyright protection typically last for a work created by an individual?",
    options: ["10 years", "The life of the author plus 70 years", "Forever", "Until someone else makes a similar work"],
    correctAnswer: "The life of the author plus 70 years",
    explanation: "In the U.S. and many other countries, copyright for works by individuals lasts for the creator's entire life plus an additional 70 years."
  },
  {
    id: 5,
    question: "Does a work need the © symbol to be protected by copyright?",
    options: ["Yes, always", "Only for digital works", "No, it's not required for works created after 1989", "Only for books and movies"],
    correctAnswer: "No, it's not required for works created after 1989",
    explanation: "While it's a good practice to use the copyright notice, it is no longer legally required in many countries, including the U.S., for works to be protected."
  },
  {
    id: 6,
    question: "Can a company own a copyright?",
    options: ["No, only individuals can be creators", "Yes, through 'work made for hire' or by acquiring the rights", "Only if the company is a registered publisher", "No, companies can only have patents"],
    correctAnswer: "Yes, through 'work made for hire' or by acquiring the rights",
    explanation: "A company can be the copyright owner if the work was created by an employee within the scope of their employment or if they purchase the copyright from the original creator."
  },
  {
    id: 7,
    question: "What is the primary purpose of copyright law?",
    options: ["To make it difficult to share content", "To ensure creators are paid for their work", "To promote the progress of science and useful arts by protecting creative works", "To limit what people can create"],
    correctAnswer: "To promote the progress of science and useful arts by protecting creative works",
    explanation: "The main goal of copyright is to encourage creativity by giving creators a limited-time monopoly over their works, which incentivizes them to create and share new things."
  },
  {
    id: 8,
    question: "If you buy a DVD of a movie, what have you purchased?",
    options: ["The copyright to the movie", "The right to show the movie publicly", "A license to own and watch a single copy of the movie", "The right to upload the movie to your channel"],
    correctAnswer: "A license to own and watch a single copy of the movie",
    explanation: "Buying a physical or digital copy of a work gives you ownership of that copy, but not the underlying copyright. You can watch it, but you can't distribute it publicly."
  },
  {
    id: 9,
    question: "Is copyright an international law?",
    options: ["No, it only applies in the country where the work was created", "Yes, there is one single international copyright law", "It's based on international treaties, but laws are specific to each country", "Only for works published on the internet"],
    correctAnswer: "It's based on international treaties, but laws are specific to each country",
    explanation: "International agreements like the Berne Convention ensure that creators are protected in other countries, but the specific details of copyright law can vary from country to country."
  },
  {
    id: 10,
    question: "What is a 'work made for hire'?",
    options: ["Any work you pay someone to create", "A work created by an employee as part of their job", "A work created for free for a friend", "A work licensed under Creative Commons"],
    correctAnswer: "A work created by an employee as part of their job",
    explanation: "In a 'work made for hire' situation, the employer, not the employee, is considered the legal author and owner of the copyright from the start."
  },

  // Section 2: What is (and isn't) Protected
  {
    id: 11,
    question: "Which of the following can be protected by copyright?",
    options: ["A simple fact", "An idea for a movie", "The script for a movie", "A short, common phrase like 'Hello, world!'"],
    correctAnswer: "The script for a movie",
    explanation: "Copyright protects the specific expression of an idea (the script), not the idea itself. Facts and short phrases are not copyrightable."
  },
  {
    id: 12,
    question: "Can you copyright a dance?",
    options: ["No, movement can't be copyrighted", "Only if it's performed by a professional", "Yes, if it's an original choreography fixed in a tangible medium (like a video)", "Only if it's for a Broadway show"],
    correctAnswer: "Yes, if it's an original choreography fixed in a tangible medium (like a video)",
    explanation: "Original choreographic works are protectable by copyright once they are captured on video or written down in notation."
  },
  {
    id: 13,
    question: "Is the software code you write for an app protected by copyright?",
    options: ["No, only the app's name is protected", "Yes, software code is considered a literary work", "Only if the app is sold for money", "No, software is protected by patents only"],
    correctAnswer: "Yes, software code is considered a literary work",
    explanation: "The source code and object code for computer programs are protected as literary works under copyright law."
  },
  {
    id: 14,
    question: "You have an amazing idea for a video game. To protect it, you should:",
    options: ["Copyright the idea immediately", "Keep it a secret, as ideas cannot be copyrighted", "Email the idea to yourself as proof", "Register the idea as a trademark"],
    correctAnswer: "Keep it a secret, as ideas cannot be copyrighted",
    explanation: "Copyright does not protect ideas. It only protects the expression of those ideas, such as the game's code, artwork, and music once they are created."
  },
  {
    id: 15,
    question: "What does it mean for a work to be in the 'public domain'?",
    options: ["It's only available in public libraries", "It was created by the government", "Its copyright has expired, and it's free for anyone to use", "It's available for free online"],
    correctAnswer: "Its copyright has expired, and it's free for anyone to use",
    explanation: "Works in the public domain have no copyright restrictions. Anyone can use, modify, and distribute them for any purpose without permission."
  },
  {
    id: 16,
    question: "Are works created by the U.S. Federal Government protected by copyright?",
    options: ["Yes, for 50 years", "No, they are generally in the public domain in the United States", "Only if they are classified", "Yes, and the government owns the copyright forever"],
    correctAnswer: "No, they are generally in the public domain in the United States",
    explanation: "Works produced by officers or employees of the U.S. federal government as part of their official duties are not subject to copyright protection in the U.S."
  },
  {
    id: 17,
    question: "Can you copyright a list of ingredients for a recipe?",
    options: ["Yes, it's a creative list", "No, a simple list of ingredients is considered a factual instruction", "Only if the recipe is very complicated", "Only if you invented the recipe"],
    correctAnswer: "No, a simple list of ingredients is considered a factual instruction",
    explanation: "A mere list of ingredients is not copyrightable. However, descriptive text, explanations, or photos accompanying the recipe are."
  },
  {
    id: 18,
    question: "Is the title of a book or movie protected by copyright?",
    options: ["Yes, always", "No, titles and short phrases are generally not copyrightable", "Only if the title is very unique", "Only if it's registered"],
    correctAnswer: "No, titles and short phrases are generally not copyrightable",
    explanation: "Titles, names, and slogans are typically not protected by copyright law, though they may be protected under trademark law."
  },
  {
    id: 19,
    question: "You take a photo of the Eiffel Tower. Who owns the copyright to the photo?",
    options: ["The French government", "The architect of the Eiffel Tower", "You, the photographer", "No one, because it's a public landmark"],
    correctAnswer: "You, the photographer",
    explanation: "While the tower itself is a landmark, your photograph of it is an original work, and you own the copyright to that specific photo. (Note: The tower's light show is copyrighted, so night photos can be complex!)."
  },
  {
    id: 20,
    question: "If you record a cover of a popular song, who owns the copyright to the cover version?",
    options: ["You own the copyright to the sound recording, but the original artist owns the underlying composition", "The original artist owns everything", "You own everything since it's your performance", "It enters the public domain"],
    correctAnswer: "You own the copyright to the sound recording, but the original artist owns the underlying composition",
    explanation: "A song has two copyrights: the musical composition (notes and lyrics) and the sound recording. Your performance is a new recording, but you still need permission (a license) for the composition."
  },
  
  // Section 3: Fair Use
  {
    id: 21,
    question: "What is 'Fair Use'?",
    options: ["A law that says all content is free to use", "A legal defense that allows limited use of copyrighted material without permission", "A type of Creative Commons license", "A rule that lets you use anything as long as you're not making money"],
    correctAnswer: "A legal defense that allows limited use of copyrighted material without permission",
    explanation: "Fair Use is not an automatic right; it's a complex legal concept and a defense one might use in court if accused of infringement. It's decided on a case-by-case basis."
  },
  {
    id: 22,
    question: "How many factors are considered in a Fair Use analysis in the U.S.?",
    options: ["One: whether you made money", "Two: purpose and amount", "Three: purpose, amount, and effect", "Four: purpose, nature, amount, and effect"],
    correctAnswer: "Four: purpose, nature, amount, and effect",
    explanation: "Courts evaluate four factors: 1) the purpose and character of the use, 2) the nature of the copyrighted work, 3) the amount used, and 4) the effect on the market for the original."
  },
  {
    id: 23,
    question: "What is considered the most important factor in modern Fair Use cases?",
    options: ["The amount of the work you used", "Whether your use is 'transformative'", "Whether the original work was published or unpublished", "Whether you are a non-profit organization"],
    correctAnswer: "Whether your use is 'transformative'",
    explanation: "A transformative use is one that adds new meaning, message, or character to the original work, such as using clips for commentary, criticism, or parody."
  },
  {
    id: 24,
    question: "Adding the disclaimer 'No Copyright Infringement Intended' to your video description:",
    options: ["Protects you under Fair Use", "Legally allows you to use any content", "Has no legal effect and does not protect you", "Transfers copyright liability to the original owner"],
    correctAnswer: "Has no legal effect and does not protect you",
    explanation: "Disclaimers like this are legally meaningless. They do not grant you any rights to use copyrighted content and won't protect you from a copyright claim."
  },
  {
    id: 25,
    question: "Giving credit to the original creator in your video description:",
    options: ["Is a substitute for getting permission", "Automatically makes your use Fair Use", "Is a good practice, but does not absolve you of copyright infringement", "Means you now co-own the copyright"],
    correctAnswer: "Is a good practice, but does not absolve you of copyright infringement",
    explanation: "Attribution is polite and sometimes required by a license, but it is not a substitute for obtaining permission and does not automatically make your use legal."
  },
  {
    id: 26,
    question: "Using a 5-second clip of a new blockbuster movie in your review video is most likely:",
    options: ["Copyright infringement because the movie is new", "Fair Use, because it's for criticism and commentary", "Illegal unless you have a press pass", "Only allowed if your channel is not monetized"],
    correctAnswer: "Fair Use, because it's for criticism and commentary",
    explanation: "Using short clips for the purpose of reviewing or critiquing a work is a classic example of what Fair Use is designed to protect."
  },
  {
    id: 27,
    question: "If you are not making money from your video, does this guarantee your use of copyrighted material is Fair Use?",
    options: ["Yes, non-commercial use is always Fair Use", "No, commerciality is just one of the four factors considered", "Yes, but only if you also give credit", "No, in fact, it makes it more likely to be infringement"],
    correctAnswer: "No, commerciality is just one of the four factors considered",
    explanation: "While non-commercial use is more likely to be considered fair, it's not a guarantee. All four factors must be weighed, and even non-monetized videos can harm the market for the original work."
  },
  {
    id: 28,
    question: "Using an entire popular song as the background music for your wedding slideshow is generally:",
    options: ["Considered Fair Use because it's for a personal event", "Not Fair Use because it's not transformative and uses the whole work", "Allowed if you bought the song on iTunes", "Legal as long as you don't upload it online"],
    correctAnswer: "Not Fair Use because it's not transformative and uses the whole work",
    explanation: "This use isn't transformative (it just uses the song for its original purpose) and it uses the entire work, which weighs heavily against Fair Use."
  },
  {
    id: 29,
    question: "Is there a specific number of seconds (e.g., 'the 10-second rule') of a song you can use that is always considered Fair Use?",
    options: ["Yes, it's 10 seconds", "Yes, it's 30 seconds", "No, there is no magic number; it depends on the context and all four factors", "Yes, but only for non-monetized videos"],
    correctAnswer: "No, there is no magic number; it depends on the context and all four factors",
    explanation: "The '10-second rule' or '30-second rule' is a myth. The amount used is analyzed in context of the whole work and the purpose of the use."
  },
  {
    id: 30,
    question: "A 'parody' is a work that imitates a famous work for comedic effect and to comment on the original. Parodies are:",
    options: ["Always copyright infringement", "Often protected under Fair Use", "Only legal with permission", "Only legal if you change 50% of the original"],
    correctAnswer: "Often protected under Fair Use",
    explanation: "Parody is a well-established form of transformative work that is often considered Fair Use because it uses the original to create a new, comedic, or critical message."
  },

  // Section 4: Platform Policies & Consequences
  {
    id: 31,
    question: "What is a 'copyright strike' on Starlight?",
    options: ["A warning you get for using bad language", "A formal penalty applied to your account for uploading infringing content", "A type of ad on your video", "A positive rating from a copyright holder"],
    correctAnswer: "A formal penalty applied to your account for uploading infringing content",
    explanation: "A copyright strike is a penalty resulting from a valid legal request (a DMCA takedown notice) from a copyright owner to remove your video."
  },
  {
    id: 32,
    question: "What is a 'Content ID claim'?",
    options: ["The same thing as a copyright strike", "An automated claim made by a system that finds matching content", "A lawsuit filed against you", "A request to collaborate"],
    correctAnswer: "An automated claim made by a system that finds matching content",
    explanation: "Content ID is an automated system. A claim from this system is not a copyright strike, but it may result in the video being monetized by the claimant, blocked, or tracked."
  },
  {
    id: 33,
    question: "What happens if you receive three copyright strikes on Starlight?",
    options: ["You get a final warning", "You have to pay a fine", "Your account and all associated channels are subject to termination", "You can no longer monetize videos"],
    correctAnswer: "Your account and all associated channels are subject to termination",
    explanation: "The 'three-strikes' policy is a serious consequence. Reaching three active strikes can lead to the permanent removal of your account and a ban from creating new ones."
  },
  {
    id: 34,
    question: "If you delete a video that has a copyright strike, what happens to the strike?",
    options: ["The strike is immediately removed", "The strike remains on your account", "The strike is transferred to another video", "The claimant is notified and can choose to remove it"],
    correctAnswer: "The strike remains on your account",
    explanation: "Deleting the video does not retract the copyright strike. The strike remains associated with your account until it expires or is resolved."
  },
  {
    id: 35,
    question: "What is a DMCA Takedown Notice?",
    options: ["A suggestion from the platform to improve your video", "An informal complaint from another user", "A legal notification from a copyright holder to a service provider to remove infringing material", "A request to monetize your video"],
    correctAnswer: "A legal notification from a copyright holder to a service provider to remove infringing material",
    explanation: "The Digital Millennium Copyright Act (DMCA) provides a legal framework for copyright owners to request the removal of their content from online platforms."
  },
  {
    id: 36,
    question: "If you receive a copyright strike that you believe is a mistake, what can you do?",
    options: ["Delete your account", "Re-upload the video and hope for the best", "File a counter-notification", "Email the CEO of the platform"],
    correctAnswer: "File a counter-notification",
    explanation: "A counter-notification is a legal process where you state, under penalty of perjury, that you have a good faith belief the material was removed by mistake or misidentification."
  },
  {
    id: 37,
    question: "Filing a false or bad-faith counter-notification can have serious legal consequences.",
    options: ["True", "False"],
    correctAnswer: "True",
    explanation: "Filing a counter-notification is a legal process. Knowingly misrepresenting that your content is not infringing can make you liable for damages, including costs and attorneys' fees."
  },
  {
    id: 38,
    question: "How long does a copyright strike typically last on your account?",
    options: ["Forever", "One year", "90 days, provided you complete Copyright School", "Until you apologize to the claimant"],
    correctAnswer: "90 days, provided you complete Copyright School",
    explanation: "Strikes have a 90-day lifespan, but completing Copyright School is a necessary step for that expiration to occur."
  },
  {
    id: 39,
    question: "What might happen to ad revenue on a video with a Content ID claim?",
    options: ["The revenue is automatically given to you", "The revenue is held by the platform and donated to charity", "The revenue is typically directed to the copyright holder", "Monetization is permanently disabled on your channel"],
    correctAnswer: "The revenue is typically directed to the copyright holder",
    explanation: "One of the most common actions for a Content ID claim is for the claimant to monetize the video, meaning they collect any ad revenue it generates."
  },
  {
    id: 40,
    question: "If your live stream includes copyrighted music playing in the background, can it be taken down?",
    options: ["No, live streams are exempt", "Only if it's longer than one hour", "Yes, live streams are subject to the same copyright rules", "Only if you are monetizing the stream"],
    correctAnswer: "Yes, live streams are subject to the same copyright rules",
    explanation: "Copyright law applies to live content just as it does to pre-recorded videos. Automated systems can detect infringement in real-time and may terminate your stream."
  },
  
  // Section 5: Permissions & Creative Commons
  {
    id: 41,
    question: "What is the safest way to use someone else's music in your video?",
    options: ["Hope they don't notice", "Get explicit permission or a license from the copyright holder", "Use only 15 seconds of the song", "Put a 'music not mine' disclaimer in the description"],
    correctAnswer: "Get explicit permission or a license from the copyright holder",
    explanation: "The only guaranteed safe way to use copyrighted material is to get a license or written permission from all the rights holders."
  },
  {
    id: 42,
    question: "A song is labeled 'Royalty-Free'. What does this usually mean?",
    options: ["The song is free to use for any purpose without payment", "The song is in the public domain", "You pay a one-time fee to get a license to use the song, without paying recurring fees (royalties)", "The song has no copyright"],
    correctAnswer: "You pay a one-time fee to get a license to use the song, without paying recurring fees (royalties)",
    explanation: "'Royalty-Free' does not mean 'free of cost'. It means you don't have to pay royalties for each use, typically after an initial licensing fee."
  },
  {
    id: 43,
    question: "What does a Creative Commons (CC) license do?",
    options: ["It removes the copyright from a work entirely", "It allows creators to grant specific permissions for others to use their work", "It automatically monetizes a video for charity", "It's a type of copyright strike"],
    correctAnswer: "It allows creators to grant specific permissions for others to use their work",
    explanation: "Creative Commons licenses are a way for creators to give the public permission to use their work in advance under certain conditions."
  },
  {
    id: 44,
    question: "If a photo has a 'CC BY' license, what must you do to use it?",
    options: ["Nothing, it's free to use", "Pay the creator", "Give appropriate credit (attribution) to the creator", "Only use it for non-commercial projects"],
    correctAnswer: "Give appropriate credit (attribution) to the creator",
    explanation: "The 'BY' in 'CC BY' stands for attribution. You must credit the original creator as specified by the license."
  },
  {
    id: 45,
    question: "What does the 'NC' in a 'CC BY-NC' license mean?",
    options: ["No Credit", "New Content", "Non-Commercial", "No Changes"],
    correctAnswer: "Non-Commercial",
    explanation: "The 'NC' restriction means you can use the work, but not for commercial purposes. This includes using it in a monetized video."
  },
  {
    id: 46,
    question: "Can you use a song with a 'CC BY-NC-ND' license in your monetized travel vlog where you've edited it to fit a scene?",
    options: ["Yes, as long as you give credit", "No, for two reasons: it's a commercial use (NC) and you've edited it (ND)", "Only the editing (ND) is a problem", "Only the commercial use (NC) is a problem"],
    correctAnswer: "No, for two reasons: it's a commercial use (NC) and you've edited it (ND)",
    explanation: "This license has two restrictions you would violate: 'Non-Commercial' (NC) because your vlog is monetized, and 'No Derivatives' (ND) because you edited the song."
  },
  {
    id: 47,
    question: "What is a 'sync license' needed for?",
    options: ["Playing a song on the radio", "Performing a song live", "Using a song in a video (synchronizing it to visuals)", "Creating a CD of a cover song"],
    correctAnswer: "Using a song in a video (synchronizing it to visuals)",
    explanation: "A synchronization (or 'sync') license is required to pair a musical composition with visual media, such as a film, TV show, commercial, or online video."
  },
  {
    id: 48,
    question: "You find a video game soundtrack on a gaming channel. The description says 'Feel free to use'. Is this sufficient permission?",
    options: ["Yes, the description is a legal license", "No, the channel may not own the rights to the music they are giving permission for", "Yes, because video game music is always free to use", "Only if you also give credit"],
    correctAnswer: "No, the channel may not own the rights to the music they are giving permission for",
    explanation: "You must get permission from the actual copyright holder (usually the game developer or composer). A random uploader likely does not have the authority to grant you a license."
  },
  {
    id: 49,
    question: "If you buy video editing software that includes a library of sample music, can you use that music in your monetized videos?",
    options: ["No, it's only for personal use", "Yes, typically the software's license allows for this", "Only if you credit the software in your description", "You have to pay an extra fee for each video"],
    correctAnswer: "Yes, typically the software's license allows for this",
    explanation: "Generally, the license for such software includes the right to use the provided assets (music, sound effects) in projects you create with it, including commercial ones. Always check the specific license agreement."
  },
  {
    id: 50,
    question: "What is CC0?",
    options: ["A very restrictive license", "A tool for dedicating a work to the public domain", "A Creative Commons license for commercial use only", "A license for government works"],
    correctAnswer: "A tool for dedicating a work to the public domain",
    explanation: "CC0 (Creative Commons Zero) allows creators to waive all their copyright and related rights in a work, effectively placing it in the public domain for anyone to use freely."
  },

  // Section 6: Scenarios and Nuances
  {
    id: 51,
    question: "You record a video in a shopping mall and a popular song is playing on the mall's speakers. This is:",
    options: ["Always okay, because it's in the background", "Called 'incidental capture' and might be okay, but could still be flagged", "Guaranteed Fair Use", "A public performance, so it's fine"],
    correctAnswer: "Called 'incidental capture' and might be okay, but could still be flagged",
    explanation: "While incidental, unintentional inclusion of background music may sometimes be overlooked, it can still be detected by automated systems like Content ID and lead to a claim."
  },
  {
    id: 52,
    question: "Is it copyright infringement to read an entire copyrighted book aloud on a live stream?",
    options: ["No, because you are performing it", "Yes, this is creating an unauthorized derivative work (an audiobook) and public performance", "Only if you are monetizing the stream", "It's Fair Use if it's for education"],
    correctAnswer: "Yes, this is creating an unauthorized derivative work (an audiobook) and public performance",
    explanation: "Reading a substantial portion or the entirety of a copyrighted book aloud is a public performance and creates a derivative work, both of which are exclusive rights of the copyright holder."
  },
  {
    id: 53,
    question: "Can you get a copyright strike for a video that is 'Unlisted' or 'Private'?",
    options: ["No, because the public can't see it", "Yes, the video still exists on the platform's servers and can be scanned or reported", "Only if you share the link with more than 10 people", "Only for 'Unlisted' videos, not 'Private' ones"],
    correctAnswer: "Yes, the video still exists on the platform's servers and can be scanned or reported",
    explanation: "Copyright rules apply to all uploaded content, regardless of its privacy setting. Automated systems can still scan unlisted and private videos."
  },
  {
    id: 54,
    question: "Your friend says you can use any content as long as you change it by 20%. Is this true?",
    options: ["Yes, the '20% Rule' is part of copyright law", "No, there is no such rule; the key factor is whether the new work is 'transformative'", "Yes, but only for images, not music", "No, the rule is 30%"],
    correctAnswer: "No, there is no such rule; the key factor is whether the new work is 'transformative'",
    explanation: "This is a common myth. There's no magic percentage of change that automatically makes a use legal. Courts look at how transformative the new work is, not just how much was changed."
  },
  {
    id: 55,
    question: "If you film a concert on your phone and upload it, who might own the copyrights you could be infringing?",
    options: ["The band (for the musical composition and performance)", "The record label (for the sound recording)", "The songwriter (for the lyrics and melody)", "All of the above"],
    correctAnswer: "All of the above",
    explanation: "A single piece of music can have many rights holders, including the songwriter, publisher, performer, and record label. A concert recording can infringe on multiple copyrights."
  },
  {
    id: 56,
    question: "A company uses a screenshot of your public video in their TV commercial without permission. Is this a potential copyright infringement?",
    options: ["No, because your video was public", "Yes, you are the copyright holder of your video and they need permission for commercial use", "No, because commercials are Fair Use", "Only if your video was monetized"],
    correctAnswer: "Yes, you are the copyright holder of your video and they need permission for commercial use",
    explanation: "As the creator of your video, you own the copyright. A company using it for their own commercial advertising would need to obtain a license from you."
  },
  {
    id: 57,
    question: "You want to use a photo you found on a search engine. What is the best course of action?",
    options: ["Assume it's free to use because it's online", "Trace it back to the source and check for licensing information", "Just credit 'Google Images' in your description", "Use it, but apply a color filter to make it different"],
    correctAnswer: "Trace it back to the source and check for licensing information",
    explanation: "Images found online are not automatically free to use. You must find the original source to see if it's in the public domain, has a Creative Commons license, or if you can purchase a license."
  },
  {
    id: 58,
    question: "Can a specific style of video editing (e.g., quick cuts, specific color grading) be copyrighted?",
    options: ["Yes, a style is a creative work", "No, styles, techniques, and methods are not protected by copyright", "Only if the editor is very famous", "Yes, but you have to file for a 'style patent'"],
    correctAnswer: "No, styles, techniques, and methods are not protected by copyright",
    explanation: "Copyright protects the final video, but not the underlying style or editing techniques used to create it. Anyone is free to adopt a similar style in their own original work."
  },
  {
    id: 59,
    question: "Does using music from a video game in your 'Let's Play' video constitute copyright infringement?",
    options: ["No, it's always considered free promotion for the game", "It can be, but many game publishers have policies that allow it", "Yes, and it will always result in a strike", "No, because you are talking over the music"],
    correctAnswer: "It can be, but many game publishers have policies that allow it",
    explanation: "Technically, it's a use of copyrighted music. However, many game developers have public policies allowing creators to use their game footage and music for videos, but it's crucial to check each publisher's specific rules."
  },
  {
    id: 60,
    question: "What is the difference between a copyright takedown and a trademark takedown?",
    options: ["They are the same thing", "Copyright protects creative works; trademark protects brand names, logos, and slogans", "Copyright is for videos; trademark is for music", "Copyright is legal; trademark is just a platform policy"],
    correctAnswer: "Copyright protects creative works; trademark protects brand names, logos, and slogans",
    explanation: "They are different types of intellectual property. A copyright issue involves using someone's video/music/art, while a trademark issue involves using a brand's logo or name in a way that could confuse consumers."
  },
  // Additional questions to reach 100
  {
    id: 61,
    question: "What exclusive right is granted to a copyright owner?",
    options: ["The right to control the price of their work.", "The right to reproduce, distribute, and perform the work.", "The right to prevent anyone from criticizing the work.", "The right to get a government grant for the work."],
    correctAnswer: "The right to reproduce, distribute, and perform the work.",
    explanation: "Copyright owners have a bundle of exclusive rights, including making copies, creating derivative works, and publicly performing or displaying the work."
  },
  {
    id: 62,
    question: "If you create a work with a friend with the intent to merge your contributions, you are considered:",
    options: ["Business partners.", "Joint authors and co-owners of the copyright.", "Competitors.", "The person who had the idea is the sole owner."],
    correctAnswer: "Joint authors and co-owners of the copyright.",
    explanation: "When two or more authors create a work together with the intention that their contributions be merged, they are considered joint authors and share ownership of the copyright."
  },
  {
    id: 63,
    question: "What is a 'tangible form of expression'?",
    options: ["An idea you described to a friend.", "A song you have in your head.", "A poem written down on paper or saved as a file.", "A general plot for a story."],
    correctAnswer: "A poem written down on paper or saved as a file.",
    explanation: "A work is 'fixed' in a tangible medium when it's captured in a sufficiently permanent form, like being written, recorded, or saved to a hard drive."
  },
  {
    id: 64,
    question: "Does copyright protect a live, unrecorded, and unscripted comedy routine?",
    options: ["Yes, all performances are automatically copyrighted.", "No, because it is not 'fixed' in a tangible medium.", "Only if the audience pays to see it.", "Only if it's longer than 10 minutes."],
    correctAnswer: "No, because it is not 'fixed' in a tangible medium.",
    explanation: "An improvisational performance that is not recorded or written down lacks the 'fixation' required for copyright protection to attach."
  },
  {
    id: 65,
    question: "Can a character be protected by copyright?",
    options: ["No, characters are just ideas.", "Yes, if a character is sufficiently original and well-delineated.", "Only if they are in a published book.", "Only if they have a registered trademark."],
    correctAnswer: "Yes, if a character is sufficiently original and well-delineated.",
    explanation: "Characters that are distinctive enough to be considered more than just a general 'stock' character can receive copyright protection."
  },
  {
    id: 66,
    question: "Is a phone book's alphabetical list of names and numbers copyrightable in the U.S.?",
    options: ["Yes, because it took a lot of work to compile.", "No, because it's a collection of facts arranged in a standard, unoriginal way.", "Only if it includes advertisements.", "Yes, the phone company owns the copyright to the data."],
    correctAnswer: "No, because it's a collection of facts arranged in a standard, unoriginal way.",
    explanation: "The U.S. Supreme Court ruled that a basic alphabetical arrangement of facts lacks the minimum creativity required for copyright protection."
  },
  {
    id: 67,
    question: "Is the broadcast of a live sporting event copyrightable?",
    options: ["No, the game itself is an unscripted event.", "Yes, the broadcast, including camera angles, commentary, and graphics, is a copyrighted audiovisual work.", "Only the instant replays are copyrighted.", "No, because it happens in a public stadium."],
    correctAnswer: "Yes, the broadcast, including camera angles, commentary, and graphics, is a copyrighted audiovisual work.",
    explanation: "While the underlying game isn't copyrighted, the creative choices made in broadcasting it are protected."
  },
  {
    id: 68,
    question: "A 'reaction video' that shows an entire movie with only occasional comments is:",
    options: ["Always Fair Use because it's a reaction.", "Likely not Fair Use because it's not transformative and can substitute for the original.", "Legal if you link to the original movie.", "Only if you monetize it."],
    correctAnswer: "Likely not Fair Use because it's not transformative and can substitute for the original.",
    explanation: "Reaction videos are strongest for Fair Use when they provide significant new commentary or criticism that transforms the original, rather than just re-displaying it."
  },
  {
    id: 69,
    question: "Is Fair Use a global concept?",
    options: ["Yes, all countries have the exact same Fair Use laws.", "No, 'Fair Use' is a U.S. legal doctrine; other countries have similar but different exceptions like 'Fair Dealing'.", "Yes, it's an internet law that applies everywhere.", "No, it only applies to content created in the United States."],
    correctAnswer: "No, 'Fair Use' is a U.S. legal doctrine; other countries have similar but different exceptions like 'Fair Dealing'.",
    explanation: "While many countries have exceptions for criticism, research, and news reporting, the flexible four-factor test of 'Fair Use' is unique to the United States."
  },
  {
    id: 70,
    question: "What is the main difference between a copyright strike and a Community Guidelines strike?",
    options: ["There is no difference.", "Copyright strikes are based on legal DMCA notices; Community Guidelines strikes are for violating platform rules like those against hate speech.", "Copyright strikes are warnings, but Community Guidelines strikes delete your channel.", "Community Guidelines strikes expire faster."],
    correctAnswer: "Copyright strikes are based on legal DMCA notices; Community Guidelines strikes are for violating platform rules like those against hate speech.",
    explanation: "One relates to intellectual property law, while the other relates to the platform's specific code of conduct."
  },
  {
    id: 71,
    question: "If your video is muted by the platform due to a Content ID claim on the music, do you also get a strike?",
    options: ["Yes, it's an automatic strike.", "No, a mute is a result of a Content ID claim and is not a formal copyright strike.", "Only if the song is from a major artist.", "Yes, and your channel is suspended."],
    correctAnswer: "No, a mute is a result of a Content ID claim and is not a formal copyright strike.",
    explanation: "Content ID claims have various outcomes (monetize, block, track, mute), but they are separate from and less severe than a formal DMCA-based copyright strike."
  },
  {
    id: 72,
    question: "What happens to your channel's features if you get a copyright strike?",
    options: ["Nothing changes at all.", "You might temporarily lose access to features like live streaming or monetization.", "Your channel is immediately deleted.", "You get more ads on your videos to pay a fine."],
    correctAnswer: "You might temporarily lose access to features like live streaming or monetization.",
    explanation: "A strike acts as a penalty and can result in the temporary loss of privileges on the platform."
  },
  {
    id: 73,
    question: "What does the 'ND' in a 'CC BY-NC-ND' license mean?",
    options: ["No Distribution", "Non-Discriminatory", "No Derivatives", "Not Dated"],
    correctAnswer: "No Derivatives",
    explanation: "The 'No Derivatives' condition means you can share the work, but you cannot modify it or create adaptations of it."
  },
  {
    id: 74,
    question: "If you hire a freelancer to edit a video for you, who owns the copyright to the final edited video by default?",
    options: ["You do, because you provided the footage.", "The freelancer, because their creative editing is an original work, unless a contract says otherwise.", "Both of you, jointly.", "The software company that made the editing program."],
    correctAnswer: "The freelancer, because their creative editing is an original work, unless a contract says otherwise.",
    explanation: "The creative choices in editing are a form of authorship. To own the final product, you need a contract transferring the copyright from the freelancer to you."
  },
  {
    id: 75,
    question: "If you want to use classical music by Mozart in your video, what do you need to be careful about?",
    options: ["You always need a license for classical music.", "Mozart's compositions are public domain, so any version is fine.", "The composition is public domain, but the specific performance and recording by a modern orchestra is likely copyrighted.", "You must credit Mozart in your video description."],
    correctAnswer: "The composition is public domain, but the specific recording by a modern orchestra is likely copyrighted.",
    explanation: "The musical composition is old enough to be public domain, but a new recording of it is a separate copyrighted work. You need to find a public domain recording or get a license."
  },
  {
    id: 76,
    question: "Can a meme be copyrighted?",
    options: ["No, all memes are in the public domain.", "It's complex; the underlying photo or clip is likely copyrighted, but a specific meme's use could be considered transformative Fair Use.", "Yes, the first person to create the meme format owns the copyright.", "No, because memes are not considered creative works."],
    correctAnswer: "It's complex; the underlying photo or clip is likely copyrighted, but a specific meme's use could be considered transformative Fair Use.",
    explanation: "Memes exist in a legal gray area. While creating and sharing them is common, they often rely on copyrighted source material, which could lead to a claim from the original owner."
  },
  {
    id: 77,
    question: "You film a public street performance. Can you upload this video?",
    options: ["Yes, anything that happens in public is free to film and use.", "It's risky; while filming in public is usually fine, the performance itself (music, choreography) is likely copyrighted.", "No, it's an invasion of the performers' privacy.", "Yes, as long as you don't monetize the video."],
    correctAnswer: "It's risky; while filming in public is usually fine, the performance itself (music, choreography) is likely copyrighted.",
    explanation: "The location being public doesn't remove the copyright from the creative work being performed. You could receive a claim for the music or other elements."
  },
  {
    id: 78,
    question: "If a work does not have a copyright notice (©), it means it's not copyrighted.",
    options: ["True, no notice means it's free to use.", "False, notice has not been required for protection in the U.S. since 1989.", "True, but only for works found on the internet.", "False, but you can use it until the owner asks you to stop."],
    correctAnswer: "False, notice has not been required for protection in the U.S. since 1989.",
    explanation: "Copyright protection is automatic upon creation for most modern works. You should always assume a work is copyrighted unless you know for sure it isn't."
  },
  {
    id: 79,
    question: "What's a common, valid reason to file a counter-notification?",
    options: ["You think the claimant is a mean person.", "You believe your video is a clear example of Fair Use.", "You deleted the video after getting the strike.", "You promise not to do it again."],
    correctAnswer: "You believe your video is a clear example of Fair Use.",
    explanation: "A counter-notification is a legal statement that you believe the takedown was a mistake. Valid reasons include having a license, the content being public domain, or believing your use is protected by Fair Use."
  },
  {
    id: 80,
    question: "What's the best way to get music for your videos?",
    options: ["Record songs from the radio.", "Use a reputable music licensing library or the platform's own audio library.", "Use popular songs and hope you don't get caught.", "Use 10-second clips of many different songs."],
    correctAnswer: "Use a reputable music licensing library or the platform's own audio library.",
    explanation: "Using services designed to provide licensed music for creators is the safest and most professional way to add a soundtrack to your videos without infringing copyright."
  },
  {
    id: 81,
    question: "What is a 'derivative work'?",
    options: ["An exact copy of a work.", "A new work based on one or more preexisting works, like a movie based on a book.", "A review of a work.", "A work that is in the public domain."],
    correctAnswer: "A new work based on one or more preexisting works, like a movie based on a book.",
    explanation: "The right to create derivative works (translations, adaptations, etc.) is one of the exclusive rights of the copyright owner."
  },
  {
    id: 82,
    question: "If you use a song from the Starlight Audio Library, are there any restrictions?",
    options: ["No, you can use it anywhere for anything.", "Yes, the license typically only allows you to use it in videos on the Starlight platform.", "Yes, you must pay royalties for every 1,000 views.", "No, it becomes your own property."],
    correctAnswer: "Yes, the license typically only allows you to use it in videos on the Starlight platform.",
    explanation: "Platform audio libraries provide a license, but that license is usually limited to use on that specific platform. You can't download the song and use it in a project elsewhere."
  },
  {
    id: 83,
    question: "Can you get a copyright strike for a video that is 'Unlisted'?",
    options: ["No, because it is not public.", "Yes, copyright policies apply to all uploaded videos, regardless of privacy setting.", "Only if you share the link.", "No, because it can't be monetized."],
    correctAnswer: "Yes, copyright policies apply to all uploaded videos, regardless of privacy setting.",
    explanation: "The video still exists on the platform's servers and can be found by automated systems or if a rights holder is given the link."
  },
  {
    id: 84,
    question: "Does copyright protect the title of your video?",
    options: ["Yes, the title is the most creative part.", "No, titles and short phrases are generally not eligible for copyright protection.", "Only if the title is longer than 10 words.", "Yes, but only after you register it."],
    correctAnswer: "No, titles and short phrases are generally not eligible for copyright protection.",
    explanation: "While a title isn't protected by copyright, a channel name or a unique series title could potentially be protected under trademark law."
  },
  {
    id: 85,
    question: "What is a key difference between a patent and a copyright?",
    options: ["Patents are for artists, copyrights are for scientists.", "Patents protect inventions and processes; copyrights protect creative works.", "Patents last forever, copyrights expire.", "There is no difference."],
    correctAnswer: "Patents protect inventions and processes; copyrights protect creative works.",
    explanation: "A patent protects an invention from being made, sold, or used by others for a certain period of time. Copyright protects the expression of an idea, like a book or a song."
  },
  {
    id: 86,
    question: "If your video is a tutorial on how to use a software program, can you show the software's interface?",
    options: ["No, this is always infringement.", "This is generally considered a valid purpose for Fair Use (commentary/teaching).", "Only if the software is open source.", "Only if you get written permission from the CEO."],
    correctAnswer: "This is generally considered a valid purpose for Fair Use (commentary/teaching).",
    explanation: "Using footage of a software's interface for the purpose of a tutorial, review, or critique is a very common and widely accepted form of Fair Use."
  },
  {
    id: 87,
    question: "What is the 'first sale doctrine'?",
    options: ["The first person to sell a work gets all the profit.", "It allows the owner of a legitimate copy of a work to sell or dispose of that copy without permission.", "It means you can't sell anything you create.", "The first sale of a work is always tax-free."],
    correctAnswer: "It allows the owner of a legitimate copy of a work to sell or dispose of that copy without permission.",
    explanation: "This is why you can legally sell your used books, CDs, or DVDs. It does not, however, give you the right to make and sell new copies."
  },
  {
    id: 88,
    question: "What is the difference between infringement and plagiarism?",
    options: ["They are the exact same legal concept.", "Infringement is a legal violation of a creator's exclusive rights; plagiarism is an ethical violation of passing off someone's work as your own.", "Plagiarism is illegal, but infringement is not.", "You can only plagiarize text."],
    correctAnswer: "Infringement is a legal violation of a creator's exclusive rights; plagiarism is an ethical violation of passing off someone's work as your own.",
    explanation: "You can plagiarize a public domain work (like copying Shakespeare without credit), which is unethical but not illegal. You can also infringe copyright without plagiarizing (like using a licensed photo but breaking the license terms)."
  },
  {
    id: 89,
    question: "If a musician releases their song for free download on their website, can you use it in your video?",
    options: ["Yes, 'free download' means it's free for any use.", "Not necessarily. You still need to check if they provided a license that allows for it.", "Yes, as long as you don't monetize your video.", "No, you must always pay for music."],
    correctAnswer: "Not necessarily. You still need to check if they provided a license that allows for it.",
    explanation: "A free download does not automatically mean permission is granted for reuse. The creator might only be giving permission for personal listening. Look for a Creative Commons license or other terms."
  },
  {
    id: 90,
    question: "What is an example of a work NOT protected by copyright?",
    options: ["A photograph you took.", "A list of all U.S. state capitals.", "A novel you wrote.", "A song you composed."],
    correctAnswer: "A list of all U.S. state capitals.",
    explanation: "Facts are not original works of authorship and therefore cannot be copyrighted. Anyone is free to use a list of state capitals."
  },
  {
    id: 91,
    question: "You film yourself playing a video game for a 'Let's Play' video. What copyrighted material might be in your video?",
    options: ["The game's visuals and art.", "The game's music and sound effects.", "The game's software code.", "All of the above."],
    correctAnswer: "All of the above.",
    explanation: "A video game is a complex multimedia work containing many different copyrighted elements. While many publishers allow Let's Plays, you are technically using their copyrighted content."
  },
  {
    id: 92,
    question: "If you receive a Content ID claim, which of these is NOT a standard option?",
    options: ["Do nothing and let the claim stand.", "Dispute the claim.", "Remove the claimed content (e.g., mute the song).", "Immediately sue the claimant."],
    correctAnswer: "Immediately sue the claimant.",
    explanation: "Suing is a major legal action and not a standard, built-in option in the Content ID dispute process. The platform provides tools to handle the claim first."
  },
  {
    id: 93,
    question: "You want to use a family photo from 1950 in your documentary. Do you need to worry about copyright?",
    options: ["No, it's a personal photo.", "Yes, the photo is still under copyright, and you'd need to find out who the rights holder is.", "No, all photos that old are public domain.", "Only if the photo is of a famous person."],
    correctAnswer: "Yes, the photo is still under copyright, and you'd need to find out who the rights holder is.",
    explanation: "A photo from 1950 is still well within the copyright term. The copyright owner would be the photographer or their heirs."
  },
  {
    id: 94,
    question: "What is the 'Safe Harbor' provision of the DMCA?",
    options: ["A rule that protects creators from all lawsuits.", "A provision that protects platforms like Starlight from liability for infringement by their users, as long as they respond to takedown notices.", "A place where copyrighted works are stored safely.", "A law that allows anyone to use content from a ship at sea."],
    correctAnswer: "A provision that protects platforms like Starlight from liability for infringement by their users, as long as they respond to takedown notices.",
    explanation: "This is a crucial part of the law that allows platforms that host user-generated content to operate without being constantly sued for their users' actions."
  },
  {
    id: 95,
    question: "Is it okay to re-upload a video that was taken down due to a copyright strike?",
    options: ["Yes, if you wait a week.", "No, re-uploading a removed video can lead to your account being terminated.", "Yes, if you change the title.", "Only if you file a counter-notification first."],
    correctAnswer: "No, re-uploading a removed video can lead to your account being terminated.",
    explanation: "Circumventing a takedown by re-uploading the same content is a serious violation of platform policies and can result in severe penalties, including account termination."
  },
  {
    id: 96,
    question: "What does the 'P' in a circle symbol (℗) usually refer to?",
    options: ["Public domain", "Copyright for the sound recording (phonorecord)", "Copyright for a performance", "Patent pending"],
    correctAnswer: "Copyright for the sound recording (phonorecord)",
    explanation: "While the © symbol is for the work in general (like the musical composition), the ℗ symbol is specifically for the copyright in the sound recording itself."
  },
  {
    id: 97,
    question: "If you make a remix of a song, have you created a new copyrighted work?",
    options: ["Yes, you own the full copyright to the remix.", "It is a new 'derivative work,' but you need a license from the original song's owner to create and distribute it legally.", "No, only the original song is copyrighted.", "Yes, and the original song enters the public domain."],
    correctAnswer: "It is a new 'derivative work,' but you need a license from the original song's owner to create and distribute it legally.",
    explanation: "Your creative additions to the remix are original, but because it's based on a pre-existing copyrighted work, you need permission to make it."
  },
  {
    id: 98,
    question: "Your video gets a Content ID claim for music, but you licensed the music from a royalty-free library. What should you do?",
    options: ["Delete the video immediately.", "Dispute the claim and provide proof of your license.", "Ignore the claim.", "Pay the claimant."],
    correctAnswer: "Dispute the claim and provide proof of your license.",
    explanation: "Mistakes in the Content ID system can happen. If you have a valid license, you have the right to dispute the claim and should provide your license information as evidence."
  },
  {
    id: 99,
    question: "Can you get in trouble for using unlicensed music in a video you only share with your family via a private link?",
    options: ["No, because it's private.", "Technically yes, it's still copyright infringement, even if you are unlikely to get caught.", "No, sharing with family is always Fair Use.", "Yes, and you will automatically get a strike."],
    correctAnswer: "Technically yes, it's still copyright infringement, even if you are unlikely to get caught.",
    explanation: "Making an unauthorized copy and distributing it, even to a small group, is technically an infringement of the copyright owner's exclusive rights. The private nature only reduces the risk of detection."
  },
  {
    id: 100,
    question: "What is the single most important thing to remember about copyright?",
    options: ["It's too complicated to understand.", "You can use anything as long as you're not caught.", "Always assume a work is copyrighted unless you know for sure it's not, and seek permission or use licensed content.", "Copyright only matters for professionals."],
    correctAnswer: "Always assume a work is copyrighted unless you know for sure it's not, and seek permission or use licensed content.",
    explanation: "This mindset is the best way to respect other creators and keep your own channel safe and in good standing."
  }
];

type Step = 'learn' | 'quiz' | 'results';

export const CopyrightSchool: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('learn');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  
  // Language Support
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [translatedQuestion, setTranslatedQuestion] = useState<QuizQuestion | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const staticQuestion = QUIZ_QUESTIONS[currentQuestionIndex];
  const activeQuestion = (selectedLanguage === 'English') ? staticQuestion : (translatedQuestion || staticQuestion);
  const PASSING_SCORE = 80;

  useEffect(() => {
    const handleTranslation = async () => {
        if (selectedLanguage === 'English') {
            setTranslatedQuestion(null);
            return;
        }
        
        setIsTranslating(true);
        const translated = await translateQuizQuestion(staticQuestion, selectedLanguage);
        if (translated) {
            setTranslatedQuestion(translated);
        }
        setIsTranslating(false);
    };

    handleTranslation();
  }, [currentQuestionIndex, selectedLanguage, staticQuestion]);

  const handleAnswerSelect = (option: string) => {
    if (isAnswered) return;
    setSelectedAnswer(option);
    setIsAnswered(true);
    if (option === activeQuestion.correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setStep('results');
    }
  };
  
  const handleReset = () => {
      setStep('quiz');
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setScore(0);
  };
  
  const renderLearnStep = () => (
    <div className="space-y-10">
      <div className="bg-[var(--background-secondary)] p-8 rounded-2xl border border-[var(--border-primary)]">
          <h2 className="text-2xl font-bold mb-4">Watch and Learn</h2>
          <p className="text-[var(--text-secondary)] mb-6">
              This short video covers the basics of copyright and fair use. Understanding these concepts is the first step to protecting your channel.
          </p>
          <div className="aspect-video bg-black rounded-lg overflow-hidden border border-[var(--border-primary)] shadow-lg">
             {/* Using a placeholder video */}
             <video 
                 controls 
                 src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4" 
                 className="w-full h-full object-cover"
             >
                 Your browser does not support the video tag.
             </video>
          </div>
      </div>

      <div className="bg-[var(--background-secondary)] p-8 rounded-2xl border border-[var(--border-primary)]">
          <h2 className="text-2xl font-bold mb-6">Key Concepts</h2>
          <div className="space-y-4">
              <div className="p-4 bg-[var(--background-primary)] rounded-lg border border-[var(--border-primary)]">
                  <h3 className="font-bold">What is Copyright?</h3>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">Copyright is a legal right that protects original works of authorship, like videos, music, and art. It gives the creator exclusive rights to control how their work is used.</p>
              </div>
              <div className="p-4 bg-[var(--background-primary)] rounded-lg border border-[var(--border-primary)]">
                  <h3 className="font-bold">What is "Fair Use"?</h3>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">Fair use is a legal doctrine that allows limited use of copyrighted material without permission for purposes like criticism, commentary, news reporting, teaching, or research.</p>
              </div>
          </div>
      </div>
      
      <div className="text-center pt-6">
        <button 
            onClick={() => setStep('quiz')}
            className="px-8 py-3 bg-[hsl(var(--accent-color))] text-white rounded-full font-bold hover:brightness-90 transition-all shadow-lg flex items-center gap-2 mx-auto"
        >
            Start Quiz <ChevronsRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  const renderQuizStep = () => (
    <div className="bg-[var(--background-secondary)] p-8 rounded-2xl border border-[var(--border-primary)] relative min-h-[400px]">
      {isTranslating ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--background-secondary)]/50 backdrop-blur-sm rounded-2xl z-10">
              <Loader2 className="w-10 h-10 animate-spin text-[hsl(var(--accent-color))]" />
              <p className="mt-4 font-semibold text-[var(--text-primary)]">Translating with Gemini AI...</p>
          </div>
      ) : (
          <>
            <p className="text-sm font-bold text-[var(--text-secondary)] mb-2">Question {currentQuestionIndex + 1} of {QUIZ_QUESTIONS.length}</p>
            <h2 className="text-xl font-bold mb-6">{activeQuestion.question}</h2>

            <div className="space-y-3 mb-6">
                {activeQuestion.options.map((option, idx) => {
                const isCorrect = option === activeQuestion.correctAnswer;
                const isSelected = option === selectedAnswer;
                let buttonClass = 'w-full text-left p-4 rounded-lg border-2 transition-all font-medium disabled:cursor-not-allowed';
                
                if (isAnswered) {
                    if (isCorrect) {
                    buttonClass += ' bg-green-500/10 border-green-500 text-green-500';
                    } else if (isSelected && !isCorrect) {
                    buttonClass += ' bg-red-500/10 border-red-500 text-red-500';
                    } else {
                    buttonClass += ' border-[var(--border-primary)] text-[var(--text-secondary)]';
                    }
                } else {
                    buttonClass += ' border-[var(--border-primary)] hover:border-[hsl(var(--accent-color))] hover:bg-[hsl(var(--accent-color))]/5';
                }

                return (
                    <button key={idx} onClick={() => handleAnswerSelect(option)} disabled={isAnswered} className={buttonClass}>
                    {option}
                    </button>
                );
                })}
            </div>
            
            {isAnswered && (
                <div className="p-4 rounded-lg bg-[var(--background-primary)] border border-[var(--border-primary)] mb-6 animate-in fade-in">
                <p className={`font-bold flex items-center gap-2 ${selectedAnswer === activeQuestion.correctAnswer ? 'text-green-500' : 'text-red-500'}`}>
                    {selectedAnswer === activeQuestion.correctAnswer ? <Check className="w-5 h-5"/> : <X className="w-5 h-5" />}
                    {selectedAnswer === activeQuestion.correctAnswer ? 'Correct!' : 'Incorrect'}
                </p>
                <p className="text-sm text-[var(--text-secondary)] mt-2">{activeQuestion.explanation}</p>
                </div>
            )}

            {isAnswered && (
                <div className="text-right">
                    <button onClick={handleNext} className="px-6 py-2 bg-[hsl(var(--accent-color))] text-white rounded-full font-bold hover:brightness-90 transition-all shadow-md">
                        {currentQuestionIndex < QUIZ_QUESTIONS.length - 1 ? 'Next Question' : 'Finish Quiz'}
                    </button>
                </div>
            )}
          </>
      )}
    </div>
  );

  const renderResultsStep = () => {
    const passed = score >= PASSING_SCORE;
    return (
      <div className={`text-center bg-[var(--background-secondary)] p-8 rounded-2xl border-2 ${passed ? 'border-green-500' : 'border-red-500'}`}>
          {passed ? (
            <Award className="w-16 h-16 text-green-500 mx-auto mb-4" />
          ) : (
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          )}
          <h2 className="text-2xl font-bold mb-2">{passed ? "Congratulations, you passed!" : "Please review and try again"}</h2>
          <p className="text-lg font-semibold text-[var(--text-secondary)] mb-6">
            You answered <span className={`font-bold ${passed ? 'text-green-500' : 'text-red-500'}`}>{score}</span> out of {QUIZ_QUESTIONS.length} questions correctly.
          </p>

          {passed ? (
            <p className="max-w-prose mx-auto text-[var(--text-primary)]">
              You've successfully completed Copyright School. Your active strike will expire in 90 days, provided you receive no additional strikes. Remember to always respect copyright.
            </p>
          ) : (
             <p className="max-w-prose mx-auto text-[var(--text-primary)]">
              You need to score at least {PASSING_SCORE} out of {QUIZ_QUESTIONS.length} to pass. Please review the educational material and retake the quiz.
            </p>
          )}

          <div className="mt-8 flex justify-center gap-4">
              {!passed && (
                  <button onClick={handleReset} className="px-6 py-3 bg-[hsl(var(--accent-color))] text-white rounded-full font-bold hover:brightness-90 transition-all shadow-lg flex items-center gap-2">
                      <RotateCw className="w-4 h-4" /> Retake Quiz
                  </button>
              )}
               <button onClick={() => navigate('/copyright-strikes')} className="px-6 py-3 bg-[var(--background-primary)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-full font-bold hover:bg-[var(--background-tertiary)] transition-all flex items-center gap-2">
                   <Home className="w-4 h-4" /> Return
              </button>
          </div>
      </div>
    );
  };
  
  return (
    <div className="w-full h-full bg-[var(--background-primary)] text-[var(--text-primary)] p-6 md:p-12 overflow-y-auto">
      <div className="max-w-3xl mx-auto">
        <header className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left flex-1">
                <div className="flex justify-center md:justify-start mb-4">
                    <BookOpen className="w-16 h-16 text-[hsl(var(--accent-color))]" />
                </div>
                <h1 className="text-4xl font-bold mb-2">Copyright School</h1>
                <p className="text-[var(--text-secondary)] text-lg">
                    Learn the essentials of copyright to keep your account in good standing.
                </p>
            </div>
            
            <div className="relative group min-w-[200px]">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Globe className="w-4 h-4 text-[var(--text-tertiary)]" />
                </div>
                <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[var(--background-secondary)] border border-[var(--border-primary)] rounded-lg text-sm font-medium focus:ring-2 focus:ring-[hsl(var(--accent-color))] outline-none appearance-none cursor-pointer"
                >
                    <option value="English">English (Original)</option>
                    {ALL_NATIVE_LANGUAGES.filter(l => l !== 'English').map(lang => (
                        <option key={lang} value={lang}>{lang}</option>
                    ))}
                </select>
                {selectedLanguage !== 'English' && (
                    <div className="absolute top-full mt-2 right-0 bg-[var(--background-secondary)] text-xs p-2 rounded border border-[var(--border-primary)] shadow-lg z-10 w-full text-center">
                        <span className="flex items-center justify-center gap-1 text-[hsl(var(--accent-color))]"><Loader2 className="w-3 h-3 animate-spin" /> AI Translation Active</span>
                    </div>
                )}
            </div>
        </header>

        <main className="animate-in fade-in slide-in-from-bottom-8 duration-500 delay-100">
            {step === 'learn' && renderLearnStep()}
            {step === 'quiz' && renderQuizStep()}
            {step === 'results' && renderResultsStep()}
        </main>
      </div>
    </div>
  );
};