#include <Servo.h>

Servo myservo;

int pos = 0;
int cntCommand = -1;

void setup() {
  myservo.attach(9);

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
      resetAll();
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
  for (pos = 175; pos >= 60; pos -= 1) {
    myservo.write(pos);
    delay(15);
  }
  for (pos = 60; pos <= 175; pos += 1) {
    myservo.write(pos);
    delay(15);
  }
  // overWrites current cmd
  cntCommand = -1;
  // tell node the cycle is completed.
  Serial.print("pitch_cycle_done\n");
}

void resetAll(){
  myservo.write(175);
  cntCommand = -1;
}
