// Zoompan

// #!/bin/bash
// input=input.mp4
// output=output.mp4

// width=$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of default=noprint_wrappers=1:nokey=1 $input)
// height=$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of default=noprint_wrappers=1:nokey=1 $input)

// ffmpeg -y -i $input -vf "scale=iw*1.5:ih*1.75, \
//   rotate=0.4 * (1 + sin(n/100))*PI/180, \
//   crop=$width:$height:(in_w-out_w)/2 + 0.35 * (1 + sin(n/100))*(in_w-out_w)/2:(in_h-out_h)/2 + 0.16 * (1 + cos(n/57))*(in_h-out_h)/2, \
//   eq=brightness=0.05:contrast=1.03:saturation=1.05, \
//   hqdn3d=4.0:3.0:6.0:4.5,unsharp=5:5:1.0:5:5:0.0" $output
