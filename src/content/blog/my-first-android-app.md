---
title: "My First Android App"
description: "It's been almost a month since I joined Bangkit Academy, and I've just finished my first Android courses. In my latest blog post, I'm sharing my thoughts on this experience."
pubDate: "Mar 17 2024"
---

It's been a month since I shared my exciting news about [joining Bangkit Academy](/blog/accepted-in-bangkit-academy). And guess what? I've just completed my first Android development courses, and I'm thrilled to announce that I built my very own Android app!

## Flexible Learning with Dicoding and Mentorship

Bangkit Academy's learning approach focuses on self-paced learning through <a href="https://www.dicoding.com/" target="_blank">Dicoding</a>, supplemented by weekly mentor meetings. This flexibility allows us to learn at our own pace, adjust to our schedules, and dive deeper into topics that pique our interest. Additionally, the weekly meetings with experienced mentors provide invaluable support - a chance to clarify doubts, ask questions, and stay motivated throughout the learning journey.

## The Courses

I learned the foundations of Android development via the course <a href="https://www.dicoding.com/academies/51" target="_blank">"Belajar Membuat Aplikasi Android untuk Pemula (Creating Android Apps for Beginners)</a>,. Six modules made up the course, and each one covered a key subject, like activity, intent, view and view group, style and theme, and recycle view.

### Activity

Activity is an important component of Android which functions to display the user interface on the user's screen and manage interactions within it. Every activity have it's own lifecycle or a series of states that it can be in. The state include

| State       | Description                                                         |
| ----------- | ------------------------------------------------------------------- |
| onCreate()  | called when the activity is first created.                          |
| onStart()   | called when the activity is becoming visible to the user.           |
| onResume()  | called when the activity will start interacting with the user.      |
| onPause()   | called when the system is about to start resuming another activity. |
| onStop()    | called when the activity is no longer visible to the user.          |
| onDestroy() | called before the activity is destroyed.                            |

In this activity i also learn about how to preserve the state using `onSaveInstanceState` and `onRestoreInstanceState` method. This two method is very useful to save the state of the activity when the activity is destroyed and restore it when the activity is recreated.

### Intent

After learning about how to display things to user i also learn about Intent. Think of Intents as messengers that carry instructions and facilitate communication between different parts of your app, like Activities, Services, and Broadcast Receivers.

There are two main types of Intents I learned about:

-   **Explicit Intents**: These are like sending an invitation with a specific address. They directly target a particular component, such as another Activity within your app, with a clear purpose. This is typically used for navigation within your application.

-   **Implicit Intents**: These are like sending a general announcement, where the recipient is not predetermined. They are used to request actions that can be handled by any app on the device, such as opening a website or sharing content. They offer flexibility, but the specific app that responds depends on what's installed on the user's device.

In order to pass or get data between activities, I learned how to use `putExtra` and `getExtra`. These methods act like a bridge, allowing you to exchange information between different parts of your app.

-   **`putExtra`:** Imagine this as packing a box with specific items you want to send to another location. You use `putExtra` to "pack" data into an Intent, specifying a key (like a label on the box) and the actual data value (the item inside).

-   **`getExtra`:** This is like receiving the box and unpacking its contents. You use `getExtra` to retrieve the data from the Intent, providing the same key you used when packing it with `putExtra`.

This allows you to share information like user input, configuration settings, or object data between activities seamlessly.

**Additionally, I learned about `Parcelable`:**

While `putExtra` and `getExtra` work for basic data types, you might encounter situations where you want to pass more complex objects between activities. This is where `Parcelable` comes in. It's an interface that allows you to make custom objects "parcelable," meaning they can be efficiently converted into a format suitable for transmission within an Intent. By implementing the `Parcelable` interface in your custom class, you unlock the ability to send complex data structures between activities, enhancing the capabilities and flexibility of your app.

### View & View Group

Imagine you're building a house. In Android development, the building blocks of your app's user interface (UI) are similar.

-   **Views:** These are the individual UI elements, like bricks in your house. They can be buttons, text boxes, images, or anything the user can see and interact with. Each view is like a small rectangular box that can draw itself on the screen.

-   **ViewGroups:** These are like the rooms or sections in your house. They act as invisible containers that hold and organize views. You can arrange and position views within a ViewGroup to create the layout and structure of your app's screens.

Here's a breakdown of their roles:

-   **Views:** They handle the appearance and user interaction. Imagine customizing the color, size, and behavior of each brick in your house.

-   **ViewGroups:** They define the layout and organization. Think of them as the blueprint that determines how the rooms and elements are arranged in your house.

There are different types of ViewGroups, each offering specific ways to arrange views. Some common ones include:

-   **LinearLayout:** Arranges views in a single row or column, like stacking bricks horizontally or vertically.

-   **RelativeLayout:** Positions views relative to each other or the edges of the container, offering more flexibility in layout.

-   **FrameLayout:** Stacks views on top of each other, with the most recent view on top, like placing furniture within a room.

-   **ScrollView**: Now, imagine your house has multiple floors, and you need a way to navigate between them if the content doesn't fit on a single screen. This is where ScrollView comes in for your app's UI.

-   **ConstraintLayout** Imagine you're working with a complex design layout for your house, where elements need to be positioned and sized relative to each other or the screen edges. This is where ConstraintLayout comes in.

Since I utilize Constrain Layout a lot, let's speak about it in more detail. In XML, the default and suggested layout for Android development is called ConstraintLayout. It provides a strong and effective method for creating intricate user interfaces (UIs) with a number of essential characteristics, including:

Simplified Layout Structure are superfluous when using ConstraintLayout, which allows you to design sophisticated layouts using just one layer of hierarchy. When compared to nested layouts, this results in improved rendering and efficiency.

The utilization of "Center Positioning & Bias" and "Relative Positioning" in Precise Positioning allows for easy alignment of components using percentages, with 50% (center) as the default. This allows for flexibility and control over the placement of components.

Visual Guide: You may ensure exact alignment and spacing in your layout design by using barier and guideline.
Layout management is made easier by using Linear Chain to assist arrange a collection of components in a linear form.

Flexible Distribution: When using a constraint layout, we can use distribution styles like "Spread Inside," which aligns the first and last elements to the edges of the chain while distributing the remaining elements evenly, and "Spread," which distributes elements evenly within the layout (default style).
Weighted Space Allocation is an additional option. When more than one widget is configured to "match constraint," they proportionally divide the available space. Additionally, we have the option to select "Packed," which would group elements together and maximize space usage.

### Style, Theme & RecyclerView

**Style:** Imagine you're decorating your house. Styles act like pre-defined design sets in Android development. They allow you to define the appearance of individual UI elements, such as text color, background color, font size, and other visual properties.

* **Benefits:** Styles offer consistency and reusability. You can create a style for buttons, text views, or any other element and apply it throughout your app to maintain a uniform look and feel. 
* **Example:** Define a style named "PrimaryButtonStyle" with specific properties for text color, background color, and corner radius. You can then apply this style to all your primary action buttons in the app.

**Theme:** Think of themes as the overall design scheme for your house. A theme in Android development combines multiple styles to create a cohesive visual identity for your entire app.

* **Components:** Themes define the default styles for various UI elements like buttons, text views, backgrounds, and more. This ensures a consistent look across all screens and activities in your app.
* **Customization:** You can create custom themes that inherit from the default theme and modify specific styles to achieve your desired look and feel. For example, you might create a "DarkTheme" that overrides the default colors for a darker app experience.

**RecyclerView:** Now, imagine you have a large collection of books in your house, and you need an efficient way to display and organize them. This is where **RecyclerView** comes in for your app's UI.

* **Efficient List Handling:** RecyclerView is a powerful and efficient view for displaying large lists of data. It recycles views that are no longer visible, reducing memory usage and improving scrolling performance.
* **Customization:** You can customize the appearance and behavior of RecyclerView using layouts and adapters. With adapters, you define how data is displayed in each list item and configure their interaction.


### Submission and My App

In the end of course i develop a simple android app that display information about anime i like, the data came from MyAnimeList that i scrape. At first i use Glide to load the image but later got rejected because app tested offline by reviewer. it's also my miss i didn't describe clearly that my app using internet in submission notes. 

Btw here is my app go check it and give your feedback by opening an issue

https://github.com/xirf/yomutoki

<<<<<<< HEAD
=======

>>>>>>> main
