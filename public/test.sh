# ffmpeg -y -i ../api/file/1741932098103.mp4 -stream_loop -1 -i ./overlay.mp4 -i ./avatars/panda.png -filter_complex "\
# [0]crop=iw:ih*0.5[origin];\
# [origin]split[top][bottom];\
# [top]pad=iw:2*ih,vaguedenoiser,eq=brightness=-0.05:contrast=1.05:saturation=1.1,unsharp,hqdn3d,deband,convolution[top];\
# [bottom]boxblur=15,eq=brightness=-0.4:contrast=0.8:saturation=0.3[bottom];\
# [top][bottom]overlay=0:h[full];\
# [full]scale=576:1024,format=gbrp[i1];\
# [1]scale=576:1024,format=gbrp[i2];\
# [i1][i2]blend=all_mode=screen:all_opacity=0.5[out1];\
# [out1][2]overlay\
# " -shortest output.mp4


ffmpeg -i /home/khuu_giang_khanh/ffm-next/public/temp/1742776852471.mp4 -y \
-filter_complex "[0:v]split=2[v1][v2];[v2]reverse[cropped];\
[cropped]crop=16:16:(iw-18)/2:(ih-18)/2[crop];\
[v1][crop]overlay=(W-16)/2:(H-16)/2" /home/khuu_giang_khanh/ffm-next/public/temp/1742776855057-.mp4