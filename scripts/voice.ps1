Add-Type -AssemblyName System.Speech
$speak = New-Object System.Speech.Synthesis.SpeechSynthesizer
$speak.SetOutputToWaveFile("C:\Users\Dave\Dropbox\Dinkbot\scripts\output.wav")
$speak.Rate = 1
$speak.Speak("$args")
$speak.Dispose()
