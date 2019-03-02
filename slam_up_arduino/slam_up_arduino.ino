#include <Servo.h>

Servo myservo;  // create servo object to control a servo
// twelve servo objects can be created on most boards

int pos = 0;    // variable to store the servo position
int cntCommand = -1;

void setup() {
  myservo.attach(9);  // attaches the servo on pin 9 to the servo object

  Serial.begin(9600);
  Serial.setTimeout(10);
  //Add following for Uno
  while(!Serial){};
}

void loop() {
  commandRouter();
  delay(100);
}

void commandRouter() {

  if(Serial.available()>0){
    cntCommand = Serial.parseInt();
  }

  switch(cntCommand){
    case -1: // standby
      break;
    case 0:
      break;
    case 1:
      runPitchCycle();
      break;
    // case 2:
    //   break;
    // case 3:
    //   break;
    // case 4:
    //   break;
    // case 5:
    //   break;
    // case 6:
    //   break;
    // case 7:
    //   break;
  }

}

void runPitchCycle() {
  for (pos = 60; pos <= 175; pos += 1) { // goes from 0 degrees to 180 degrees
    // in steps of 1 degree
    myservo.write(pos);              // tell servo to go to position in variable 'pos'
    delay(15);                       // waits 15ms for the servo to reach the position
  }
  for (pos = 175; pos >= 60; pos -= 1) { // goes from 180 degrees to 0 degrees
    myservo.write(pos);              // tell servo to go to position in variable 'pos'
    delay(15);                       // waits 15ms for the servo to reach the position
  }
  // overWrites current cmd
  cntCommand = -1;
}
